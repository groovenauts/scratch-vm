const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const log = require('../../util/log');

//import * as tf from '@tensorflow/tfjs';
const tf = require("@tensorflow/tfjs");
const speechCommands = require('@tensorflow-models/speech-commands');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/png;base64,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';

/**
 * The max amount of time the Listen And Wait block will listen for.  It may listen for less time
 * if we get back results that are good and think the user is done talking.
 * Currently set to 10sec. This should not exceed the speech api limit (60sec) without redoing how
 * we stream the microphone data data.
 * @type {int}
 */
const listenAndWaitBlockTimeoutMs = 10000;

/**
 * Class for the new blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3SoundDetectionBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * The recognizer
         */
        this._recognizer = speechCommands.create('BROWSER_FFT', 'directional4w');
        this._recognizer.ensureModelLoaded().then(() => {
            this._transfer = this._recognizer.createTransfer("model");
        });
        this.runtime.on('PROJECT_STOP_ALL', this._stopListening.bind(this));
    }

    /**
     * Call to suspend getting data from the microphone.
     * @private
     */
    _stopListening () {
        if (this._transfer) {
            this._transfer.stopListening();
        }
        this.runtime.emitMicListening(false);
    }

    /**
     * Kick off the listening process.
     * @private
     */
    _startListening () {
        if (!this._transfer) {
            return;
        }
        this.runtime.emitMicListening(true);
        this._threshold = 0.5;
        this._label = this._trigger = null;
        this._transfer.listen(result => {
            let maxScore = 0;
            let maxIndex = -1;
            for (let i = 0; i < result.scores.length; i++) {
                if (result.scores[i] > maxScore) {
                    maxScore = result.scores[i];
                    maxIndex = i;
                }
            }
            this._label = maxIndex + 1;
            this._trigger = maxIndex + 1;
        }, { includeSpectrogram: false, probabilityThreshold: this._threshold });
    }

    /**
     * The key to load & store a target's speech-related state.
     * @type {string}
     */
    static get STATE_KEY () {
        return 'Scratch.soundDetection';
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'soundDetection',
            name: 'Sound Detection',
            name: formatMessage({
                id: 'soundDetection.categoryName',
                default: 'Sound Detection',
                description: 'Label for the sound detection extension category'
            }),
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setModel',
                    text: formatMessage({
                        id: 'imageDetection.setModel',
                        default: 'enter your model key = [KEY]',
                        description: 'Load your custom model.'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "🔑"
                        }
                    }
                },
                {
                    opcode: 'resetModel',
                    text: formatMessage({
                        id: 'imageDetection.resetModel',
                        default: 'reset your model',
                        description: 'clear your custom model.'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'startListening',
                    text: formatMessage({
                        id: 'soundDetection.startListening',
                        default: 'start listening',
                        description: 'start listening from microphone.'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'stopListening',
                    text: formatMessage({
                        id: 'soundDetection.stopListening',
                        default: 'stop listening',
                        description: 'stop listening from microphone.'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'whenHeard',
                    text: 'when [WORD] heard',
                    text: formatMessage({
                        id: 'soundDetection.whenHeard',
                        default: 'when [WORD] heard',
                        description: 'fire event when [WORD] is heard.'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        WORD: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getLabel',
                    text: 'sound',
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
            }
        };
    }

    setModel(args) {
        if (this._transfer && this._transfer.isListening()) {
            this._transfer.stopListening();
        }
        if (this._transfer) {
            const url = "https://storage.googleapis.com/ai-techpark-data/models/sound-detection/v1/" + args.KEY + "/model.json"
            this._transfer.load(url).then(() => {
                console.log("Model loaded");
                this._transfer.words = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    resetModel() {
        if (this._transfer && this._transfer.isListening()) {
            this._transfer.stopListening();
        };
    }

    startListening () {
        this._startListening();
    }

    stopListening () {
        this._stopListening();
    }

    getLabel() {
        return this._label;
    }

    whenHeard(args) {
        const label = args.WORD;
        if (this._trigger == label) {
          this._trigger = null;
          return true;
        } else {
          return;
        }
    }
}

module.exports = Scratch3SoundDetectionBlocks;
