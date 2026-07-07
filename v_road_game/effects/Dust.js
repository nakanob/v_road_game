// effects/Dust.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Dust {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.vehicle = vehicle;

        this.group = new THREE.Group();

        this.scene.add(this.group);

        this.maxParticles = 250;

        this.particles = [];

        const geometry = new THREE.SphereGeometry(
            0.18,
            6,
            6
        );

        const material = new THREE.MeshStandardMaterial({

            color: 0xbda98b,

            transparent: true,

            opacity: 0.45,

            depthWrite: false

        });

        for (let i = 0; i < this.maxParticles; i++) {

            const mesh = new THREE.Mesh(

                geometry,

                material.clone()

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

            particle.life = 1;

            particle.mesh.visible = true;

            particle.mesh.position.copy(
                this.vehicle.position
            );

            particle.mesh.position.y += 0.3;

            const angle =
                Math.random() * Math.PI * 2;

            const radius =
                Math.random() * 1.2;

            particle.mesh.position.x +=
                Math.cos(angle) * radius;

            particle.mesh.position.z +=
                Math.sin(angle) * radius;

            particle.velocity.set(

                (Math.random() - 0.5) * 3,

                Math.random() * 1.5,

                (Math.random() - 0.5) * 3

            );

            particle.mesh.scale.setScalar(

                0.5 + Math.random()

            );

            particle.mesh.material.opacity = 0.45;

            return;

        }

    }

    update(delta) {

        if (!this.vehicle.model) return;

        if (Math.abs(this.vehicle.speed) > 5) {

            this.spawn();

        }

        for (const particle of this.particles) {

            if (particle.life <= 0) continue;

            particle.life -= delta;

            particle.mesh.position.addScaledVector(

                particle.velocity,

                delta

            );

            particle.velocity.y += 0.8 * delta;

            particle.mesh.scale.multiplyScalar(

                1 + delta * 0.8

            );

            particle.mesh.material.opacity =

                particle.life * 0.45;

            if (particle.life <= 0) {

                particle.mesh.visible = false;

            }

        }

    }

}
