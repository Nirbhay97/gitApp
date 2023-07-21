if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const cheerio = require('cheerio');
const axios = require("axios");
var JSSoup = require('jssoup').default;
const DOMParser = require("dom-parser");
const bodyParser = require("body-parser");
const app = express();
app.use("/static", express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { default: mongoose, mongo } = require("mongoose");
const fs = require("fs");
app.use(express.json());
const multer = require("multer");
app.set("view engine", "hbs");
const path = require("path");
const tempelatePath = path.join(__dirname, "../tempelates");
const TextFile = require("../Models/FileModel");
const { User } = require("../Models/Users");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", tempelatePath);
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const cors = require("cors");

const {
  initializingPassport,
  ensureAuthenticated,
  ensureNotAuthenticated,
} = require("./passport-config.js");

const { Configuration, OpenAIApi } = require("openai");
initializingPassport(passport);

let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

app.use(methodOverride("_method"));
app.use(cors());
const port = process.env.PORT;
app.listen(port || process.env.port, () => {
  console.log(`server running on port ${port}`);
});
const mongodbURL = process.env.mongodbUrl;
const connectDb = async () =>
  await mongoose
    .connect(mongodbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to mongodb");
    })
    .catch((err) => {
      console.log(err.message);
    });

connectDb();

app.get("/about-me", (req, res) => {
  res.render("about-me", { layout: "../tempelates/layout/main" });
});

app.get("/search",(req, res, next) => {
  if(req.user) return next();
  res.redirect("/login");
}, (req, res) => {
  res.render("search", { layout: "../tempelates/layout/main" });
});

app.post("/search", async (req, res) => {
  try {
    const searchElements = req.body.search.split(",");
    let arr = [];
    for (let i = 0; i < searchElements.length; i++) {
      searchElements[i] = searchElements[i].trim();
      const data = await TextFile.find({
        FileTags: { $in: [searchElements[i]] },
      }).limit(10);
      for (let Filenow of data) {
        const date = new Date(Filenow.createdAt);
        dateDate = date.getDate();
        dateMonth = date.getMonth();
        dateYear = date.getFullYear();
        Filenow.dateDate = dateDate;
        Filenow.dateMonth = months[dateMonth];
        Filenow.dateYear = dateYear;
        arr.push(Filenow);
      }
    }
    res.render("all", {
      layout: "../tempelates/layout/main",
      arr: arr,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/all", async (req, res) => {
  try {
    const data = await TextFile.find().limit(5);
    let arr = [];
    for (let Filenow of data) {
      console.log(Filenow.createdAt);
      const date = new Date(Filenow.createdAt);
      dateDate = date.getDate();
      dateMonth = date.getMonth();
      dateYear = date.getFullYear();
      Filenow.dateDate = dateDate;
      Filenow.dateMonth = months[dateMonth];
      Filenow.dateYear = dateYear;
      arr.push(Filenow);
    }
    res.render("all", {
      layout: "../tempelates/layout/main",
      arr: arr,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    console.log(req.method);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // console.log(path.extname(file.originalname));
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Specify the filename
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file Upload");
    return;
  }
  const originalFileName = req.file.originalname;
  const savedFilename = req.file.filename;
  const filepath = req.file.path;
  let tagData = req.body.tags;
  let tagArray = tagData.split(",");
  const fileExtension = req.file.filename.split(".").pop();
  tagArray.push(fileExtension);
  console.log(originalFileName, savedFilename, filepath);

  fs.readFile(filepath, "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to read file" });
    } else {
      // console.log(data);
      await TextFile.create({
        content: data,
        UploadedFileName: originalFileName,
        FileTags: tagArray,
      });
      let Filedata = "";
      Filedata += data;
      const toRender = data;
      res.render("uploaded", {
        layout: "../tempelates/layout/main",
        messages: toRender.trim(),
        Filename: req.file.originalname,
      });
    }
  });

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
});

app.get("/login", ensureNotAuthenticated, (req, res) => {
  res.render("login", { layout: "../tempelates/layout/main"});
});

app.use(
  expressSession({
    cookie: { maxAge: 60000 },
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

app.get("/signup", ensureNotAuthenticated, (req, res) => {
  res.render("signup", { layout: "../tempelates/layout/main" });
});

app.post("/signup", async (req, res) => {
  let { strname, username, password, email } = req.body;
  console.log(req.body);
  bcrypt.hash(password, 10, async function (err, hash) {
    try {
      password = hash;
      const user = await User.create({
        strname,
        username,
        password,
        email,
      });
      console.log(user);
      res.redirect("/login");
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  });
});

// app.get("/logout", ensureNotAuthenticated ,(req, res) => {
//   req.logout();
//   res.redirect("/");
// });

app.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { layout: "../tempelates/layout/main" });
});

app.get("/", (req, res) => {
  res.render("home-before-login", { layout: "../tempelates/layout/main" });
});

app.get("/home", ensureAuthenticated, (req, res) => {
  res.render("home-after-login", { layout: "../tempelates/layout/main" });
});

app.delete("/logout", ensureNotAuthenticated, (req, res) => {
  req.logout();
  res.redirect("/login");
});

// var fetchUrl = null;
// var temp = document.getElementById("searchButtonP");
// temp.addEventListener("click", () => {
//     var userp = document.getElementById("searchInputP").value;
//     // compileCode(userp);
//     fetchUrl = userp;
//     console.log(userp);
// });


app.get("/compilar", async (req, res, next) => {

  //diff


  //===========================================
  
  const url = "https://codeforces.com/contest/1840/problem/A";
  axios.get(url)
  .then((response) => {
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    const problemStatement = $('.problem-statement').text().trim();

    res.render("compilar", {layout: "../tempelates/layout/main"});

    function removeMathJaxSyntax(inputString) {
      // Regular expression to match MathJax syntax
      const mathJaxRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    
      // Replace MathJax syntax with an empty string
      const plainString = inputString.replace(mathJaxRegex, '');
    
      return plainString;
    }

    
    console.log(removeMathJaxSyntax(problemStatement));
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });
})


app.post("/compilar", async (req, res, next) => {
    console.log(req);
    return res.render("compilar", {layout: "../tempelates/layout/main"});
})










// // console.log(s);
    // console.log(s.length);
    // console.log(s.indexOf("problem-statement"));
    // let ans = "";

    // const regex = /"(.*?)"/g;
    // const matches = s.match(regex);
    // const strings = matches ? matches.map(match => match.slice(1, -1)) : [];
    
    // for(let i = 0; i < strings.length; i++ ) {
    //   console.log(strings[i]);
    // }
    // // for(let i = s.indexOf("problem-statement"); i < 1000; i++){
    //   // if(s[i] === '"'){
    //   //   while(i + 1 < s.length && s[i + 1] !== '"'){
    //   //     ans += s[i];
    //   //     i += 1;
    //   //   }
    //    console.log((char)(s.charAt(i)));
     
    //   // }
    // }

    // console.log(ans);
// make a new parser
    // const parser = new DOMParser();

    // convert html string into DOM
    // const doc = parser.parseFromString(htmlStr, "text/html").getElementsByClassName("problem-statement");
    // var soup = new JSSoup(data);
    // var tag = soup.find('div');
    // tag.name
    // 'head'
    // console.log(tag)
    // res.render("compilar", {layout: "../tempelates/layout/main", data:data});

    // console.log(doc);