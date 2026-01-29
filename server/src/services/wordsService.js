import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// équivalent propre de __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const wordsPath = path.join(__dirname, '..', '..', 'data', 'words.json')

const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'))

function getAllWords() {
  return words
}

export default {
  getAllWords,
}