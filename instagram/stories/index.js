const instory = require('instory')
let utils = require('../utils')

instory('juran918').then(response => {
    
  for(value of response.story){
      utils.download(value.url, value.code, function(){
          console.log('done')
      })
  }
   
})

