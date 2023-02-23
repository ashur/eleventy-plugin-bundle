const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const hashCache = {};
const directoryExistsCache = {};

const debug = require("debug")("Eleventy:Bundle");

class BundleFileOutput {
	constructor(outputDirectory, bundleDirectory) {
		this.outputDirectory = outputDirectory;
		this.bundleDirectory = bundleDirectory;
		this.hashLength = 10;
	}

	getFilenameHash(content) {
		if(hashCache[content]) {
			return hashCache[content];
		}

		let hash = createHash("sha256");
		hash.update(content);
		let base64hash = hash.digest('base64').replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
		let filenameHash = base64hash.substring(0, this.hashLength);
		hashCache[content] = filenameHash;
		return filenameHash;
	}

	getFilename(filename, extension) {
		return filename + (extension && !extension.startsWith(".") ? `.${extension}` : "");
	}

	modifyPathToUrl(dir, filename) {
		return "/" + path.join(dir, filename).split(path.sep).join("/");
	}

	writeBundle(content, type, writeToFileSystem) {
		let dir = path.join(this.outputDirectory, this.bundleDirectory);
		let filenameHash = this.getFilenameHash(content);
		let filename = this.getFilename(filenameHash, type);

		if(writeToFileSystem) {
			if(!directoryExistsCache[dir]) {
				fs.mkdirSync(dir, { recursive: true });
				directoryExistsCache[dir] = true;
			}

			let fullPath = path.join(dir, filename);
			debug("Writing bundle %o", fullPath);
			fs.writeFileSync(fullPath, content);
		}

		return this.modifyPathToUrl(this.bundleDirectory, filename);
	}
}

module.exports = BundleFileOutput;