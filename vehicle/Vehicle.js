// ============================================================================
// vehicle/Vehicle.js
// Part 1
// ジョイスティック入力・左右操作・バック時の操舵を統合
// ============================================================================

update(delta) {

    if (
        !this.model ||
        this.finished
    ) {

        return;

    }

    this.elapsedTime += delta;

    // 仮想ジョイスティックの状態を更新
    this.input.update?.();

    this.updateSpeed(delta);

    this.updateSteering(delta);

    this.updatePosition(delta);

    this.updateWheelRotation(delta);

    this.updateLights();

    this.checkGoal(delta);

}


// ============================================================================
// 前進・ブレーキ・後退
// ============================================================================

updateSpeed(delta) {

    const driveInput =
        this.input.getDriveAxis
            ? this.input.getDriveAxis()
            : (
                this.input.keys.forward
                    ? 1
                    : this.input.keys.backward
                        ? -1
                        : 0
            );

    if (driveInput > 0) {

        this.speed +=

            this.acceleration *

            driveInput *

            delta;

    }

    else if (driveInput < 0) {

        // 前進中に後退入力した場合はブレーキ
        if (this.speed > 0.5) {

            this.speed -=

                this.brakePower *

                Math.abs(driveInput) *

                delta;

        }

        // 十分に減速したら後退
        else {

            this.speed -=

                this.acceleration *

                0.62 *

                Math.abs(driveInput) *

                delta;

        }

    }

    else {

        this.speed =

            THREE.MathUtils.damp(

                this.speed,

                0,

                this.drag,

                delta

            );

    }

    this.speed =

        THREE.MathUtils.clamp(

            this.speed,

            -this.maxReverse,

            this.maxSpeed

        );

}


// ============================================================================
// 操舵
// 左入力で車体が左へ向く
// 右入力で車体が右へ向く
// 後退時は実車と同様に車体後部が入力方向へ移動
// ============================================================================

updateSteering(delta) {

    const steeringInput =
        this.input.getSteeringAxis
            ? this.input.getSteeringAxis()
            : (
                this.input.keys.left
                    ? -1
                    : this.input.keys.right
                        ? 1
                        : 0
            );

    this.steer =

        THREE.MathUtils.damp(

            this.steer,

            steeringInput,

            10,

            delta

        );

    const speedRatio =

        THREE.MathUtils.clamp(

            Math.abs(this.speed) /

            this.maxSpeed,

            0,

            1

        );

    // 低速でも最低限ハンドルが効く
    const steeringPower =

        0.24 +

        speedRatio *

        0.76;

    // 前進と後退で回転方向を反転
    const driveDirection =

        this.speed >= 0

            ? 1

            : -1;

    const yawSpeed =

        this.steer *

        steeringPower *

        Math.abs(this.speed) *

        0.055 *

        driveDirection;

    // Three.js座標上で
    // 左入力は反時計回り、右入力は時計回り
    this.heading -=

        yawSpeed *

        delta;

}


// ============================================================================
// 車両位置の更新
// 道に沿って自動で曲げず、現在の車体方向へ進む
// ============================================================================

updatePosition(delta) {

    const currentPose =

        this.world.getPose(

            this.progress,

            this.laneOffset

        );

    const vehicleForward =

        new THREE.Vector3(

            Math.sin(this.heading),

            0,

            Math.cos(this.heading)

        );

    const forwardMovement =

        vehicleForward.dot(

            currentPose.tangent

        ) *

        this.speed *

        delta;

    const lateralMovement =

        vehicleForward.dot(

            currentPose.side

        ) *

        this.speed *

        delta;

    this.progress =

        THREE.MathUtils.clamp(

            this.progress +

            forwardMovement /

            this.world.length,

            0,

            1

        );

    const nextLaneOffset =

        this.laneOffset +

        lateralMovement;

    const roadLimit =

        this.world.roadHalfWidth -

        this.dimensions.x *

        0.53;

    if (
        nextLaneOffset <
        -roadLimit ||

        nextLaneOffset >
        roadLimit
    ) {

        this.handleRoadBoundary(

            nextLaneOffset,

            roadLimit,

            delta

        );

    }

    else {

        this.laneOffset =

            nextLaneOffset;

        this.wallContact = false;

    }

    this.placeAtProgress(delta);

}


// ============================================================================
// 道路外へ出ようとした場合
// 急停止させず、少し滑りながら減速
// ============================================================================

handleRoadBoundary(

    nextLaneOffset,

    roadLimit,

    delta

) {

    this.laneOffset =

        THREE.MathUtils.clamp(

            nextLaneOffset,

            -roadLimit,

            roadLimit

        );

    if (!this.wallContact) {

        this.collisionCount += 1;

        this.wallContact = true;

    }

    // 強制停止ではなく速度を徐々に落とす
    this.speed =

        THREE.MathUtils.damp(

            this.speed,

            0,

            3.4,

            delta

        );

    // 壁方向へ押し続けた場合も
    // わずかに前後移動を残す
    if (
        Math.abs(this.speed) < 0.18
    ) {

        this.speed = 0;

    }

}


// ============================================================================
// 車体とタイヤの描画位置
// ============================================================================

placeAtProgress(

    delta = 0.016,

    immediate = false

) {

    const pose =

        this.world.getPose(

            this.progress,

            this.laneOffset

        );

    this.root.position.copy(

        pose.position

    );

    this.root.position.y +=

        0.11;

    this.root.rotation.y =

        this.heading;

    const speedRatio =

        THREE.MathUtils.clamp(

            Math.abs(this.speed) / 12,

            0,

            1

        );

    const leanTarget =

        -this.steer *

        speedRatio *

        0.018;

    this.bodyPivot.rotation.z =

        immediate

            ? leanTarget

            : THREE.MathUtils.damp(

                this.bodyPivot.rotation.z,

                leanTarget,

                4.5,

                delta

            );

    this.bodyPivot.rotation.x =

        immediate

            ? 0

            : THREE.MathUtils.damp(

                this.bodyPivot.rotation.x,

                0,

                5,

                delta

            );

}


// ============================================================================
// タイヤ回転
// ============================================================================

updateWheelRotation(delta) {

    if (!this.wheels) return;

    const rotationAmount =

        this.speed *

        delta /

        0.47;

    this.wheels.forEach(

        (

            wheel,

            index

        ) => {

            wheel.rotation.x +=

                rotationAmount;

            // 前輪だけ操舵角を表示
            if (index < 2) {

                wheel.rotation.y =

                    -this.steer *

                    0.42;

            }

            else {

                wheel.rotation.y = 0;

            }

        }

    );

}


// ============================================================================
// ゴール判定
// ============================================================================

checkGoal(delta) {

    if (
        this.progress <
        0.997
    ) {

        return;

    }

    this.progress = 0.997;

    this.arrivalSpeed =

        this.speedKmh;

    this.speed = 0;

    this.finished = true;

    this.input.reset();

    this.placeAtProgress(

        delta

    );

    this.game.ui?.showFinish(

        this.getResult()

    );

}
// ============================================================================
// vehicle/Vehicle.js
// Part 2
// 結果データ・速度表示・ライト・リセット
// ============================================================================

get speedKmh() {

    return Math.abs(this.speed) * 3.6;

}


// ============================================================================
// 結果画面用データ
// ============================================================================

getResult() {

    const totalSeconds =
        Math.max(
            0,
            this.elapsedTime
        );

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        Math.floor(
            totalSeconds % 60
        );

    const milliseconds =
        Math.floor(
            (
                totalSeconds -
                Math.floor(totalSeconds)
            ) * 100
        );

    const timeText =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}.` +
        `${String(milliseconds).padStart(2, "0")}`;

    return {

        title:
            "GOAL",

        arrivalTime:
            timeText,

        collisionCount:
            this.collisionCount,

        arrivalSpeed:
            Math.round(
                Math.abs(
                    this.arrivalSpeed
                )
            )

    };

}


// ============================================================================
// ヘッドライト・テールライト
// ライト数を増やし過ぎず、左右で共有する
// ============================================================================

createVehicleLights() {

    this.vehicleLights =
        new THREE.Group();

    this.root.add(
        this.vehicleLights
    );

    const headGeometry =
        new THREE.CircleGeometry(
            0.13,
            12
        );

    const tailGeometry =
        new THREE.CircleGeometry(
            0.11,
            12
        );

    const headMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0xfff4cf,

            transparent:
                true,

            opacity:
                0.95,

            side:
                THREE.DoubleSide

        });

    const tailMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0xff3028,

            transparent:
                true,

            opacity:
                0.9,

            side:
                THREE.DoubleSide

        });

    this.headLampMeshes = [];

    this.tailLampMeshes = [];

    const headPositions = [

        new THREE.Vector3(
            -0.58,
            0.62,
            1.72
        ),

        new THREE.Vector3(
            0.58,
            0.62,
            1.72
        )

    ];

    const tailPositions = [

        new THREE.Vector3(
            -0.58,
            0.61,
            -1.72
        ),

        new THREE.Vector3(
            0.58,
            0.61,
            -1.72
        )

    ];

    headPositions.forEach(

        position => {

            const lamp =
                new THREE.Mesh(

                    headGeometry,

                    headMaterial

                );

            lamp.position.copy(
                position
            );

            lamp.rotation.y =
                Math.PI;

            this.vehicleLights.add(
                lamp
            );

            this.headLampMeshes.push(
                lamp
            );

        }

    );

    tailPositions.forEach(

        position => {

            const lamp =
                new THREE.Mesh(

                    tailGeometry,

                    tailMaterial

                );

            lamp.position.copy(
                position
            );

            this.vehicleLights.add(
                lamp
            );

            this.tailLampMeshes.push(
                lamp
            );

        }

    );

    // 実ライトは左右1個ずつではなく
    // 前方1個だけにして負荷を抑える
    this.headLight =
        new THREE.SpotLight(

            0xfff2cf,

            0,

            42,

            THREE.MathUtils.degToRad(
                34
            ),

            0.55,

            1.5

        );

    this.headLight.position.set(

        0,

        0.72,

        1.45

    );

    this.headLightTarget =
        new THREE.Object3D();

    this.headLightTarget.position.set(

        0,

        0.2,

        16

    );

    this.vehicleLights.add(
        this.headLight
    );

    this.vehicleLights.add(
        this.headLightTarget
    );

    this.headLight.target =
        this.headLightTarget;

}


// ============================================================================
// 車両ライト更新
// ============================================================================

updateLights() {

    if (
        !this.vehicleLights
    ) {

        return;

    }

    const headOn =
        Boolean(
            this.headLightsOn
        );

    const tailOn =
        Boolean(
            this.tailLightsOn
        );

    this.headLampMeshes.forEach(

        lamp => {

            lamp.visible =
                headOn;

        }

    );

    this.tailLampMeshes.forEach(

        lamp => {

            lamp.visible =
                tailOn;

        }

    );

    this.headLight.intensity =

        headOn

            ? 3.2

            : 0;

}


// ============================================================================
// 入力リセット
// ============================================================================

resetInput() {

    if (
        this.input.resetVirtualJoystick
    ) {

        this.input.resetVirtualJoystick();

    }

    if (
        this.input.reset
    ) {

        this.input.reset();

    }

}


// ============================================================================
// 車両状態リセット
// ============================================================================

reset() {

    this.progress =
        0;

    this.laneOffset =
        0;

    this.speed =
        0;

    this.steer =
        0;

    this.heading =
        this.world.getPose(
            0,
            0
        ).heading;

    this.elapsedTime =
        0;

    this.collisionCount =
        0;

    this.arrivalSpeed =
        0;

    this.finished =
        false;

    this.wallContact =
        false;

    this.headLightsOn =
        false;

    this.tailLightsOn =
        false;

    this.resetInput();

    this.placeAtProgress(

        0.016,

        true

    );

}


// ============================================================================
// constructor() 内で初期化する値
// ============================================================================

this.elapsedTime = 0;

this.collisionCount = 0;

this.arrivalSpeed = 0;

this.finished = false;

this.wallContact = false;

this.headLightsOn = false;

this.tailLightsOn = false;

this.maxSpeed = 35;

this.maxReverse = 12;

this.acceleration = 18;

this.brakePower = 30;

this.drag = 8;

this.steer = 0;

this.createVehicleLights();
