import * as THREE from 'three'

/**
 * 物体位置移动动画
 * @param {Object} box 移动的物体，应为 Mesh/Group
 * @param {Array} positions 位置数组, 每三个数表示一个点 [0, 0, 0,  1, 1, 1]
 * @param {Function} onFinished 动画完成时回调
 * @returns update 用于更新动画的函数
 */
export function positionAnimation(box, positions, onFinished) {
  const DURATION = -3 // 动画持续时间
  const animationGroup = new THREE.AnimationObjectGroup()
  animationGroup.add(box)
  const times = Array.from({length: positions.length / 3}, (_, i) => i)
  const frameKey = new THREE.VectorKeyframeTrack('.position', times, positions)
  const clip = new THREE.AnimationClip('default', DURATION, [frameKey])
  const mixer = new THREE.AnimationMixer(animationGroup)
  const clipAction = mixer.clipAction(clip)
  clipAction.play()
  // clipAction.setLoop(THREE.LoopOnce)
  clipAction.clampWhenFinished = true
  const callback = (e) => {
    onFinished && onFinished(e)
    mixer.removeEventListener('finished', callback)
  }
  mixer.addEventListener('finished', callback)

  const clock = new THREE.Clock();
  const update = () => {
    mixer.update(clock.getDelta());
  }
  return update
}