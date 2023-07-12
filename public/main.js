// pass options to ace.edit


// code for the uploaded code editor

// let element = document.querySelector("#editor");
// window.alert("here is the ocde");

// let file_name = document.getElementsByClassName("file_name")[0].textContent;
// let programming_lang = "";
// for(let i = file_name.length - 1; i >= 0; i--){
//     if(file_name[i] == '.'){
//         break;
//     }
//     programming_lang += file_name[i];
// }

// programming_lang = programming_lang.split("").reverse().join("").trim();
// console.log(programming_lang)

// let final_lang;

// if(programming_lang === "cpp") final_lang = "c_cpp";
// else if(programming_lang === 'py') final_lang = 'python';
// else if(programming_lang === 'java') final_lang = 'java';
// console.log(final_lang);

// ace.edit(element, {
//     theme: "ace/theme/monokai",
//     mode: "ace/mode/c_cpp",
// })

// let compilarObj = document.querySelector("editor_c");
// ace.edit(compilarObj, {
//     theme: "ace/theme/monokai",
//     mode: "ace/mode/c_cpp"
// })


// for comilar........... above is for upload code show, 

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");

var compileBtn = document.getElementById("compileBtn");
compileBtn.addEventListener("click", () => {
    var userInput = document.getElementById("userInput").value;
    compileCode(userInput);
});

function compileCode(userInput) {
   
    var code = editor.getValue();
    var language = "cpp"; // Change to the desired programming language

    console.log("vaue" + userInput);
    // Make an API request to JDoodle
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.jdoodle.com/v1/execute");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var outputDiv = document.getElementById("output");
                outputDiv.innerHTML = response.output;
                console.log(response.output);
            } else {
                console.log("Error:", xhr.status);
            }
        }
    };

    var data = {
        script: code,
        language: language,
        versionIndex: "0",
        stdin: userInput,
        clientId: "d4da456fbf15326d8b5e17e870cbc1fa",
        clientSecret: "7fb3e73d8cdd9bc0dfc21d2c4dc2ccda648c0cafb23a92f3998b1fe414897a2d"
    };

    xhr.send(JSON.stringify(data));
}



// for gpt prompting......

