// core/AssetLoader.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.179/examples/jsm/loaders/GLTFLoader.js";

export class AssetLoader {

    constructor() {

        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();

        this.textures = new Map();
        this.models = new Map();

        this.total = 0;

        this.loaded = 0;

        this.callbacks = [];

    }



    onProgress(callback) {

        this.callbacks.push(callback);

    }

    notifyProgress() {

        this.loaded++;

        const percent =

        Math.floor(

            this.loaded /

            this.total *

            100

        );

        for (const callback of this.callbacks) {

            callback(percent);

        }

    }


    
    loadTexture(name, url) {
        this.total++;

        return new Promise((resolve, reject) => {

            this.textureLoader.load(

                url,

                (texture) => {

                    texture.colorSpace =
                        THREE.SRGBColorSpace;

                    texture.wrapS =
                        THREE.RepeatWrapping;

                    texture.wrapT =
                        THREE.RepeatWrapping;

                    this.textures.set(
                        name,
                        texture
                    );
                    this.notifyProgress();
                    resolve(texture);

                },

                undefined,

                reject

            );

        });

    }

    loadGLB(name, url) {
        this.total++;
        return new Promise((resolve, reject) => {

            this.gltfLoader.load(

                url,

                (gltf) => {

                    this.models.set(
                        name,
                        gltf.scene
                    );
                    this.notifyProgress();
                    resolve(gltf.scene);

                },

                undefined,

                reject

            );

        });

    }

    getTexture(name) {

        return this.textures.get(name);

    }

    getModel(name) {

        const model = this.models.get(name);

        if (!model) return null;

        return model.clone(true);

    }

    clear() {

        this.textures.forEach(texture => {

            texture.dispose();

        });

        this.textures.clear();

        this.models.clear();

    }

}
