<template>
  <div>
    <ul class="menu">
      <li v-for="item in menus" :class="{active: item.value === active}" :key="item.value" @click="active = item.value">{{item.label}}</li>
    </ul>
  </div>
  <component :is="active" />
</template>

<script>
import LightSettings from '@/components/LightSettings.vue';
import LabSetting from '@/components/LabSetting.vue';
import TrackAnimation from '@/components/TrackAnimation.vue';
export default {
  name: 'App',
  components: {
    LightSettings,
    LabSetting,
    TrackAnimation
  },
  data() {
    return {
      menus: [
        { label: '灯光', value: 'LightSettings' },
        { label: '实验室', value: 'LabSetting' },
        { label: '轨迹动画', value: 'TrackAnimation' },
      ],
      active: 'LabSetting'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  top: 0;
}

</style>

<style scoped>
.menu {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  list-style: none;
  display: flex;
}
li {
  font-size: 16px;
  margin: 0 4px;
  color: #fff;
  border-bottom: 1px solid transparent;
  cursor: pointer;
}
li.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
}
li:hover {
  color: #409EFF;
}
</style>
