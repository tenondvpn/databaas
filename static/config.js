/*
 * @description: 描述信息
 * @Author: Cheng kaixuan
 * @Date: 2024-01-30 15:16:34
 * @LastEditors: why
 * @LastEditTime: 2025-03-03 10:23:58
 * @LastEditors: why
 * @LastEditTime: 2024-07-11 19:21:14
 */
window.CONFIG = {
  activeUser: "tiDavaless",
  users: {
    tiDavaless: {
      appPath: "/h5",
      chain: "天河链",
      showBottomLogo: true,
      menuBottom: "天河数通",
      keywords: "",
      description:
        "TiDavaless（TH-DLake）是基于天河链（TH-Chain）构建的可信数据共享流通平台，解决数据不愿共享、共享难的问题。TiDavaless创新性的采用数据服务模式替代数据汇聚模式，不仅极大的降低了数据共享难度，还通过区块链安全可信机制，保障数据流通的可控、可信、可溯源，同时基于TiDavaless数据网关实现数据全生命周期管理、数据共享交换和数字资产交易。",
      isShowCode: true,
      version: "V2.0.1",
      showVisual: true,
      didDefault: 1,
      captchaMode: false,
      chainDetailUrl: "#/tiChain",
      loginType: "C",
      firstPage: "/portal/home",
      copyrightMain: "Copyright©2024 湖南数据产业集团. All rights reserved. ICP许可证号 湘ICP备13002754号",
      // copyrightMain: "技术支持：湖南数据产业集团有限公司",
      copyrightSub: "湘网信备43012119362664710038号",
      clientTitle: "要素化流通平台",
      // clientTitle: "湖南数据授权运营平台",
      footerCompany: "湖南天河国云科技有限公司",
      footerAddress: "湖南省长沙市天华北路260号星沙区块链产业园2F",
      footerTel: "0731-85196076",
      footerEmail: "yinhaibo@tianhecloud.com",
      serviceLink: [
        { name: "数据登记平台", url: `http://118.249.86.235:28000/`, blank: true },
        { name: "可信开发空间", url: `http://10.229.0.23:8000/`, blank: true },
        { name: "数据开发平台", url: `https://drm.devmis.hnchasing.com/#/home`, blank: true }
      ],
      friendshipLink: [
        { name: "国家数据局", url: "https://www.nda.gov.cn", isPop: false, popImg: "/img/pages/home/qrcode_country.png" },
        { name: "湖南省政府", url: "https://www.hunan.gov.cn" },
        { name: "湖南省数据局", isPop: true, popImg: "/img/pages/home/qrcode_province.jpg" },
        { name: "财信金控", url: "https://www.hnchasing.com" },
        { name: "湖南数据产业集团", url: "https://digital.hnchasing.com" }
        // { name: '天河国云', url: 'https://www.tianhecloud.com' },
        // { name: '科创信息', url: 'http://www.chinacreator.com' }
      ],
      manageUrl: "http://opr.datafty.hunan-data.com/#/login"
    }
  }
}
