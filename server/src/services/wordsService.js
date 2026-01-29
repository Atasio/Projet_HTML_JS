import fs from 'fs'
import path from 'path'

const __dirname = new URL('../../', import.meta.url).pathname
console.log(__dirname);
const wordsPath = path.join(__dirname, 'data', 'words.json')

const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'))

function getAllWords() {
  return words
}

export default {
  getAllWords,
}
