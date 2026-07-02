// world/Sky.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Sky {

    constructor(sceneManager) {

        this.scene = sceneManager.scene;

        this.createSky();

    }

    createSky() {

        const geometry = new THREE.SphereGeometry(

            5000,

            64,

            64

        );

        const material = new THREE.ShaderMaterial({

            side: THREE.BackSide,

            depthWrite: false,

            uniforms: {

                topColor: {

                    value: new THREE.Color(
                        0x4fa9ff
                    )

                },

                bottomColor: {

                    value: new THREE.Color(
                        0xe7f6ff
                    )

                }

            },

            vertexShader: `

                varying vec3 vWorldPosition;

                void main(){

                    vec4 worldPosition = modelMatrix * vec4(position,1.0);

                    vWorldPosition = worldPosition.xyz;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

                }

            `,

            fragmentShader: `

                uniform vec3 topColor;

                uniform vec3 bottomColor;

                varying vec3 vWorldPosition;

                void main(){

                    float h = normalize(vWorldPosition).y;

                    float t = max(h * 0.5 + 0.5,0.0);

                    gl_FragColor = vec4(

                        mix(

                            bottomColor,

                            topColor,

                            t

                        ),

                        1.0

                    );

                }

            `

        });

        this.mesh = new THREE.Mesh(

            geometry,

            material

        );

        this.scene.add(

            this.mesh

        );

    }

}
