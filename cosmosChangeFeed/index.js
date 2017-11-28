const request = require('request');

const recognitionEndpoint = 'http://example.com';

let context;

module.exports = (ctx, inputDocument) => {
    context = ctx;
    if (!!inputDocument && inputDocument.length > 0) {
        context.log('inputDocument:', inputDocument);
        context.bindings.outputDocument = [];
        const recognizePromise = [];

        inputDocument.forEach(imageData => {
            const imageId = imageData.id;
            const imageUrl = imageData.url || 'testUrl';
            const status = imageData.status;

            if (!imageId || !imageUrl) return;

            if (status === 'JUST_STORED' || status === undefined) {
                recognizePromise.push(new Promise((resolve, reject) => {
                    callRecognitionAPI({
                        id: imageId,
                        url: imageUrl
                    }).then(res => {
                        imageData.status = 'OBJECT_RECOGNIZED';

                        context.log('update document', imageData);
                        context.bindings.outputDocument.push(imageData);
                        resolve();
                    });
                }));
            } else if (status === 'OBJECT_RECOGNIZED') {
                return;
            } else {
                return;
            }

        });

        Promise.all(recognizePromise).then(res => {
            context.res = {
                body: 'Result is ' + context.bindings.outputDocument
            };
            context.done();
        });
    }
}


const callRecognitionAPI = info => {
    return new Promise((resolve, reject) => {
        const body = {
            url: info.imageUrl,
        }
        const options = {
            url: recognitionEndpoint,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        };
        request.post(options, (error, response, body) => {
            if (error) {
                context.log('Recognition Error: ', error);
                resolve(body); //debug
            } else {
                resolve(body);
            }
        });
    });
};