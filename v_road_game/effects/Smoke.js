// effects/Smoke.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Smoke {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.vehicle = vehicle;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.particles = [];

        this.maxParticles = 120;

        const geometry = new THREE.SphereGeometry(
            0.15,
            8,
            8
        );

        for (let i = 0; i < this.maxParticles; i++) {

            const material =
                new THREE.MeshStandardMaterial({

                    color: 0x666666,

                    transparent: true,

                    opacity: 0

                });

            const mesh = new THREE.Mesh(

                geometry,

                material

            );

            mesh.visible = false;

            this.group.add(mesh);

            this.particles.push({

                mesh,

                velocity: new THREE.Vector3(),

                life: 0

            });

        }

    }

    spawn() {

        for (const particle of this.particles) {

            if (particle.life > 0) continue;

            particle.life = 1.0;

            particle.mesh.visible = true;

            particle.mesh.position.copy(
                this.vehicle.position
            );

            particle.mesh.position.y += 1.2;

            const backward = new THREE.Vector3(

                -Math.sin(this.vehicle.direction),

                0,

                -Math.cos(this.vehicle.direction)

            );

            particle.mesh.position.add(

                backward.multiplyScalar(1.5)

            );

            particle.velocity.set(

                (Math.random() - 0.5) * 0.4,

                0.8 + Math.random() * 0.4,

                (Math.random() - 0.5) * 0.4

            );

            particle.mesh.scale.setScalar(

                0.4

            );

            particle.mesh.material.opacity = 0.35;

            return;

        }

    }

    update(delta) {

        if (!this.vehicle.model) return;

        if (

            this.vehicle.input.keys.brake &&

            Math.abs(this.vehicle.speed) > 15

        ) {

            this.spawn();

        }

        for (const particle of this.particles) {

            if (particle.life <= 0) continue;

            particle.life -= delta * 0.7;

            particle.mesh.position.addScaledVector(

                particle.velocity,

                delta

            );

            particle.mesh.scale.multiplyScalar(

                1 + delta

            );

            particle.mesh.material.opacity =

                particle.life * 0.35;

            if (particle.life <= 0) {

                particle.mesh.visible = false;

            }

        }

    }

}
