const path = require('path');
const errors = require('@tryghost/errors');
const {i18n} = require('../../../../lib/common');
const config = require('../../../../config');

const checkFileExists = (fileData) => {
    return !!(fileData.mimetype && fileData.path);
};

const checkFileIsValid = (fileData, types, extensions) => {
    const type = fileData.mimetype;

    if (types.includes(type) && extensions.includes(fileData.ext)) {
        return true;
    }

    return false;
};

module.exports = function upload(options) {
    const type = options.type;

    // if we finish the data/importer logic, we forward the request to the specified importer
    return function uploadValidation(req, res, next) {
        const extensions = (config.get('uploads')[type] && config.get('uploads')[type].extensions) || [];
        const contentTypes = (config.get('uploads')[type] && config.get('uploads')[type].contentTypes) || [];

        req.file = req.file || {};
        req.file.name = req.file.originalname;
        req.file.type = req.file.mimetype;

        // Check if a file was provided
        if (!checkFileExists(req.file)) {
            return next(new errors.ValidationError({
                message: i18n.t(`errors.api.${type}.missingFile`)
            }));
        }

        req.file.ext = path.extname(req.file.name).toLowerCase();

        // Check if the file is valid
        if (!checkFileIsValid(req.file, contentTypes, extensions)) {
            return next(new errors.UnsupportedMediaTypeError({
                message: i18n.t(`errors.api.${type}.invalidFile`, {extensions: extensions})
            }));
        }

        next();
    };
};

module.exports._test = {
    checkFileExists,
    checkFileIsValid
};
