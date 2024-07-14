const fs = require("fs")

module.exports.deleteFile = async (path) => {
    fs.unlink(path, (err) => {
        if (err) {
          console.error(err)
          return
        }
    })
}