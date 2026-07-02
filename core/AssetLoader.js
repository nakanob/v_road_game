// core/AssetLoader.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.179/examples/jsm/loaders/GLTFLoader.js";

export class AssetLoader {

    constructor() {

        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();

        this.textures = new Map();
        this.models = new Map();

    }

    loadTexture(name, url) {

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

                    resolve(texture);

                },

                undefined,

                reject

            );

        });

    }

    loadGLB(name, url) {

        return new Promise((resolve, reject) => {

            this.gltfLoader.load(

                url,

                (gltf) => {

                    this.models.set(
                        name,
                        gltf.scene
                    );

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
