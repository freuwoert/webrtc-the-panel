<template>
    <div class="launchpad">
        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        mounted() {
            // this.audioOutput.stream.getAudioTracks().forEach(track => {
            //     this.peerConnection.addTrack(track, this.audioOutput.stream)
            // })
            // this.peerConnection.addTrack(this.audioOutput.stream)
            // console.log(this.audioOutput.getTracks())

            // this.loadAudio('./IntruderAlert.mp3')
        },

        methods: {
            // loadAudio(url) {
            //     fetch(url)
            //     .then(response => response.arrayBuffer())
            //     .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            //     .then(audioBuffer => {
            //         this.buffers.audio.push(audioBuffer)
            //     })
            // },

            // playAudio(index) {
            //     console.log(index)
            //     let source = this.audioContext.createBufferSource()
            //     source.buffer = this.buffers.audio[index]
            //     source.connect(this.audioOutput)
            //     source.start()
            //     console.log(source)
            // },
        }
    }
</script>

<style lang="sass" scoped>
    .launchpad
        background: var(--bg)
        border-radius: 4px
        position: relative
</style>