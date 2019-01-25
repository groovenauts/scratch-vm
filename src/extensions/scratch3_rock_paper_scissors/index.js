const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const Video = require('../../io/video');

const RPS_CLASSES = {
  0: "Rock",
  1: "Paper",
  2: "Scissors",
  3: "None",
};

//import * as tf from '@tensorflow/tfjs';
const tf = require("@tensorflow/tfjs");

/**
 * pretrained mobilenet model file URL
 * @type {string}
 */
const MOBILENET_MODEL_PATH = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

const IMAGE_SIZE = 224;

const MY_MODEL_PATH = 'https://storage.googleapis.com/ai-techpark-assets/rock-paper-scissors-collector/models/trained_model.json';

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
 * Class for the new blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3RockPaperScissorsBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        //this._onTargetCreated = this._onTargetCreated.bind(this);
        //this.runtime.on('targetWasCreated', this._onTargetCreated);
    }

    _loop() {
      setTimeout(this._loop.bind(this), Math.max(this.runtime.currentStepTime, 100));

      const time = Date.now();
      if (this._lastUpdate == null) {
        this._lastUpdate = time;
      }
      const offset = time - this._lastUpdate;
      if (offset > 100) {
        const frame = this.runtime.ioDevices.video.getFrame({ format: Video.FORMAT_IMAGE_DATA, dimensions: [IMAGE_SIZE, IMAGE_SIZE] });
        if (frame) {
          const logits = tf.tidy(() => {
            const img = tf.fromPixels(frame).toFloat();
            const offset = tf.scalar(127.5);
            const normalized = img.sub(offset).div(offset);
            const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
            embedding = this.model.predict(batched);
            return this.output.predict(embedding);
          });
          logits.data().then((value) => {
            this.logits = value;
            this.top4LabelsAndProbs = this.getTop4(this.logits);
          });
        }
      }
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        this.runtime.ioDevices.video.enableVideo();

        /* load mobilenet model */
        tf.loadModel(MOBILENET_MODEL_PATH).then(net => {
          net = tf.model({inputs: net.inputs, outputs: net.getLayer('conv_pw_13_relu').output});
          this.model = net;
          this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();
          tf.loadModel(MY_MODEL_PATH).then(mynet => {
            this.output = mynet;
            if (this.runtime.ioDevices) {
              this._loop();
            }
          });
        });

        return {
            id: 'rockPaperScissors',
            name: 'Rock-Paper-Scissors',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'getPrediction',
                    text: 'prediction of hand',
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
            }
        };
    }

    /**
     * Get the prediction.
     * @return {number} - the user agent.
     */
    getPrediction () {
        return this.top4LabelsAndProbs[0].label;
    }

  getTop4(logits) {
    const valuesAndIndices = [];
    for (i in logits) {
      valuesAndIndices.push({ value: logits[i], index: i})
    }
    valuesAndIndices.sort((a, b) => { return b.value - a.value })
    const top4LabelsAndProbs = [];
    for (let i = 0; i < 4; i++){
      top4LabelsAndProbs.push({ label: RPS_CLASSES[valuesAndIndices[i].index], prob: valuesAndIndices[i].value });
    }
    return top4LabelsAndProbs;
  }
}

module.exports = Scratch3RockPaperScissorsBlocks;
