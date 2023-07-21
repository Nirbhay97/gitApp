
// const cheerio = require("cheerio");

// async function fetchData(){
//     var fetchUrl = "https://codeforces.com/contest/1840/problem/A";
//     var temp = document.getElementById("searchButtonP");
//     temp.addEventListener("click", () => {
//         fetchUrl = document.getElementById("searchInputP").value;
//         putQuestion(fetchUrl);
//         console.log(fetchUrl);
//     });


// // async function  putQuestion(fetchUrl){

// //     // const post = await fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) => res.json());
// //     // // document.getElementById("spanId").innerText = post.title;
// //     // console.log(post.title);

// //     const post = await fetch("https://codeforces.com/contest/1840/problem/A").then( (res) => res.data() );
// //     console.log(post);
    
// //     // console.log(res);
// //     const html = post;

// //     // Load the HTML into Cheerio
// //     const $ = cheerio.load(html);

// //     // // Extract the inner text of the desired div
// //     const problemStatement = $('.problem-statement').text().trim();
// //     console.log(problemStatement);

    
// //     // .catch((error) => {
// //     // console.error(`Error: ${error.message}`);
// //     // });


// // }


// async function putQuestion(fetchUrl){
//         async function getHTML(url) {
//             const response = await fetch(url);
//             const html = await response.text();
//                 return html;
//         }

//         // Usage example:
//         const targetURL = "https://codeforces.com/contest/1840/problem/A"; // Replace with the URL you want to fetch
//         getHTML(targetURL)
//         .then((html) => {
//             // Now you have the HTML content, you can pass it to Cheerio
//             const $ = cheerio.load(html);

//             // Perform any HTML parsing or manipulation using Cheerio here
//             const problemStatement = $('.problem-statement').text().trim();
//             console.log(problemStatement);

//         })
//         .catch((error) => {
//             console.error('Error fetching data:', error);
//         });
// };

// };

// module.exports = 