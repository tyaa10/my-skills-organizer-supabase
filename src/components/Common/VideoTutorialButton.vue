<template lang="pug">
  // Кнопка просмотра обучающего видео
  button.button--big.button.button-default.button-video-tutorial(@click.prevent="showVideoTutorial")
    font-awesome-icon(:icon="'play'")
    span {{buttonText}}
</template>

<script>
export default {
  name: 'VideoTutorialButton',
  data () {
    return {}
  },
  props: ['url', 'buttonText'],
  methods: {
    showVideoTutorial () {
      window.open(this.url)
    }
  }
}
</script>

<style lang="stylus" scoped>
  .button-video-tutorial
    direction ltr
    font-weight 500
    height auto
    line-height normal
    max-width 220px
    min-height 40px
    padding 8px 16px
    width 100%
    text-align left
    -webkit-box-shadow 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12)
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12)
    span
      font-size 14px
      padding-left 16px
      text-transform none
      vertical-align middle
      color #757575
    svg
      border none
      display inline-block
      height 18px
      vertical-align middle
      width 18px
</style>
