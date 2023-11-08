<template>
  <div class="wscn-http401-container">
    <div class="wscn-http401">
      <div class="pic-401">
        <img class="pic-401__parent" src="@/assets/401_images/401.png" alt="401">
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">OOPS!</div>
        <div class="bullshit__headline">{{ message }}</div>
        <div class="bullshit__info">当前页面功能需要系统授权才能使用，您当前缺少相应授权；如需使用该功能，请联系管理员申请授权。</div>
        <div class="bullshit__info">页面将在 {{ waitseconds }} 秒后返回首页，或者您可以点击下面的按钮，直接返回首页。</div>
        <a ref="gotoHome" href="" class="bullshit__return-home">返回首页</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page401',
  data() {
    return {
      waitseconds: 15,
      message: '警告：当前页面您没有权限访问！'
    }
  },
  mounted() {
    setTimeout(this.countdown, 1000);
  },
  methods: {
    countdown() {
      if (this.waitseconds > 1) {
        this.waitseconds--;
        setTimeout(this.countdown, 1000);
      } else {
        setTimeout(() => {
          this.waitseconds--;
          this.$refs['gotoHome'].click();
        }, 1000);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wscn-http401-container{
  height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wscn-http401 {
  display: flex;
  align-items: center;
  overflow: hidden;
  .pic-401 {
    position: relative;
    float: left;
    width: 500px;
    overflow: hidden;
    &__parent {
      width: 85%;
    }
  }
  .bullshit {
    position: relative;
    float: left;
    width: 300px;
    padding: 30px 0;
    overflow: hidden;
    &__oops {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }
    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #222;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      margin-bottom: 30px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }
    &__return-home {
      display: block;
      float: left;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }
    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}
</style>
