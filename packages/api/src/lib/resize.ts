const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

export function resizeForThumbnail(file_path, type) {

    return new Promise((resolve, reject) => {

        const baseName = path.join(path.dirname(file_path), path.basename(file_path, path.extname(file_path)));

        try {
            const buf = fs.readFileSync(file_path);
            const image = sharp(buf);

            image.rotate().metadata()
                .then(function (metadata) {
                    // resizing by long axis
                    if (type === 'P') {
                        if (metadata.orientation >= 5 && metadata.orientation <= 8) {
                            if (metadata.height > metadata.width) {
                                return Promise.all([
                                    image.resize({ width: 1920 }).toFile(file_path),
                                    image.resize({ width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`),
                                ])
                            }
                            else {
                                return Promise.all([
                                    image.resize({ height: 1920 }).toFile(file_path),
                                    image.resize({ height: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`)
                                ])
                            }
                        }
                        else {
                            if (metadata.height > metadata.width) {
                                return Promise.all([
                                    image.resize({ height: 1920 }).toFile(file_path),
                                    image.resize({ height: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`),
                                ])
                            }
                            else {
                                return Promise.all([
                                    image.resize({ width: 1920 }).toFile(file_path),
                                    image.resize({ width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`)
                                ])
                            }
                        }
                    }
                    else {
                        if (metadata.orientation >= 5 && metadata.orientation <= 8) {
                            if (metadata.height > metadata.width) {
                                return Promise.all([
                                    image.resize({ width: 1920 }).toFile(file_path),
                                    image.resize({ height: 300, width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`),
                                ])
                            }
                            else {
                                return Promise.all([
                                    image.resize({ height: 1920 }).toFile(file_path),
                                    image.resize({ height: 300, width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`)
                                ])
                            }
                        }
                        else {
                            if (metadata.height > metadata.width) {
                                return Promise.all([
                                    image.resize({ height: 1920 }).toFile(file_path),
                                    image.resize({ height: 300, width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`),
                                ])
                            }
                            else {
                                return Promise.all([
                                    image.resize({ width: 1920 }).toFile(file_path),
                                    image.resize({ height: 300, width: 300 }).jpeg().toFile(`${baseName}_thumb.jpeg`)
                                ])
                            }
                        }
                    }
                })
                .then(() => {
                    resolve(`${baseName}_thumb.jpeg`);
                })
                .catch(function (err) {
                    reject(err)
                });

        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
};


export function resize(file_path) {

    return new Promise((resolve, reject) => {

        fs.readFile(file_path, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                const image = sharp(data)
                image.rotate().metadata()
                    .then(function (metadata) {
                        // resizing by minor axis
                        if (metadata.orientation >= 5 && metadata.orientation <= 8) {
                            if (metadata.height > metadata.width) {
                                return image.resize({ height: 300 }).toFile(file_path)
                            }
                            else {
                                return image.resize({ width: 300 }).toFile(file_path)
                            }
                        }
                        else {
                            if (metadata.height > metadata.width) {
                                return image.resize({ width: 300 }).toFile(file_path)
                            }
                            else {
                                return image.resize({ height: 300 }).toFile(file_path)
                            }
                        }
                    })
                    .then(function (info) {
                        resolve(info);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            }
        });
    });
};

export function resizeAttatchedImg(file_path) {

    return new Promise((resolve, reject) => {

        fs.readFile(file_path, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                const image = sharp(data)
                image.rotate().metadata()
                    .then(function (metadata) {
                        // resizing by minor axis
                        if (metadata.orientation >= 5 && metadata.orientation <= 8) {
                            if (metadata.height > metadata.width) {
                                return image.resize({ height: 720 }).toFile(file_path)
                            }
                            else {
                                return image.resize({ width: 720 }).toFile(file_path)
                            }
                        }
                        else {
                            if (metadata.height > metadata.width) {
                                return image.resize({ width: 720 }).toFile(file_path)
                            }
                            else {
                                return image.resize({ height: 720 }).toFile(file_path)
                            }
                        }
                    })
                    .then(function (info) {
                        resolve(info);
                    })
                    .catch(function (err) {
                        reject(err)
                    });
            }
        });
    });
};



type Metadata = { orientation: number, height: number, width: number }
type SizeOption = { longSideSize: number } | { shortSideSize: number }
const DEFAULT_SIZE_OPTION: SizeOption = { longSideSize: 1920 };

const getResizeOption = (metadata: Metadata, options: SizeOption) => {
    const isRotated = metadata.orientation >= 5 && metadata.orientation <= 8;
    const isHeightGreater = isRotated ? metadata.width > metadata.height : metadata.height > metadata.width;

    if (isHeightGreater) {
        return 'longSideSize' in options ? { height: options.longSideSize } : { width: options.shortSideSize };
    } else {
        return 'longSideSize' in options ? { width: options.longSideSize } : { height: options.shortSideSize };
    }
}
    

export async function resizeImageBuffer(fileBuffer: Buffer, sizeOption: SizeOption = DEFAULT_SIZE_OPTION): Promise<Buffer> {
    const image = sharp(fileBuffer);
    const metadata = await image.rotate().metadata();
    const resizeOption = getResizeOption(metadata, sizeOption);

    return image.resize(resizeOption).toFormat('jpeg').toBuffer();
}
