<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 {{$t('about.about')}}
      p {{$t('about.description_p1')}}
      p {{$t('about.description_p2')}}
      p {{$t('about.description_p3')}}
      p
        strong {{$t('about.description_p4')}}
  section
    .container
      // Кнопка просмотра обучающего видео
      VideoTutorialButton(:url="$t('video-tutorial-button.url')")
</template>
<script>
import VideoTutorialButton from './Common/VideoTutorialButton.vue'
export default {
  components: {
    VideoTutorialButton
  }
}
</script>

<style lang="stylus" scoped></style>
