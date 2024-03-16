console.log("hello a")


import("./b.js").then((b)=>{
  b.func()
})