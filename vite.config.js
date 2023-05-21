import * as fs from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')
const pages = resolve(__dirname, 'src', 'pages')
const publicDir = resolve(__dirname, 'src', 'public')

const sketchesPlg = createPluginToSetPageList("sketches")
const experimentsPlg = createPluginToSetPageList("experiments")
const templatesPlg = createPluginToSetPageList("templates")

function createPluginToSetPageList(dirName){
	// Get directory path
	const dirPath = resolve(__dirname, 'src', 'pages', dirName)
	//console.log("dirPath:",dirPath)

	// Get list of directory names for each page
	const dirNameList = fs.readdirSync(dirPath)
	//console.log("dirNameList:",dirNameList)

	// Config for rollupOptions (Get a list of each page name and path of index.html)
	const pagesConfig = dirNameList.reduce((arr, pageName) => {
		arr[pageName] = resolve(pages, dirName, pageName, 'index.html')
		return arr
	}, {})
	//console.log("pagesConfig:",pagesConfig)

	// Create HTML for the list that transitions to each page
	const pagesListHtml = dirNameList
		.map((pageName) => `<li><a href="./pages/${dirName}/${pageName}/index.html">${pageName}</a></li>`)
		.join('')
	//console.log("pagesListHtml:",pagesListHtml)

	// Define pluguin that rewrites index.html and inserts HTML for links that transition to each page
	const pluginToSetList = () => {
		return {
			name: 'plugin-to-set-'+dirName+'-list',
			transformIndexHtml(html) {
				return html.replace(`<ul id="${dirName}Index"><\/ul>`, `<ul id="${dirName}Index">${pagesListHtml}</ul>`)
			},
		}
	}

	return {pagesConfig, pluginToSetList};
}

//===========================================

// Vite config
export default defineConfig({
	root,
	base: '/vite-ts-web-sketches/', 
	publicDir: publicDir,
	build: {
		outDir,
		rollupOptions: {
			input: {
				main: resolve(root, 'index.html'),
				...sketchesPlg.pagesConfig,
				...experimentsPlg.pagesConfig,
				...templatesPlg.pagesConfig,
			},
		},
	},
	plugins: [sketchesPlg.pluginToSetList(), experimentsPlg.pluginToSetList(), templatesPlg.pluginToSetList()],
})