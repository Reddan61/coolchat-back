const fs = require('fs').promises;
const FileType = require('file-type');
const moment = require('moment');


module.exports.uploadFile = async (files) => {
    const extensions = ["image/jpg", "image/jpeg", "image/png","audio/ogg"];

    const fileArr = files.filter(async (el) => {
        const fileType = await FileType.fromBuffer(el)
        return extensions.includes(fileType.mime) 
    });

    const urlFilesArr = fileArr.map(async (el) => {
        const date = moment().format("DDMMYYYY-HHmmss SSS");
        const fileType = await FileType.fromBuffer(el)
        const filename = `uploads/${date}-${Math.random() * 1000}.${fileType.ext}`
        await fs.writeFile(filename,el)
        return filename;
    })

    return Promise.all(urlFilesArr);
}