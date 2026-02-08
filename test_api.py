import requests
import json

# ================= 配置区域 =================
BASE_URL = "http://82.156.224.174:7001/pipeline"  # 你的 Django 服务地址
# 如果你使用了 DRF Token 认证，请填入你的 Token
# 如果没有开启认证，可以移除 headers 中的 Authorization 字段
TOKEN = "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" 

HEADERS = {
    'Authorization': f'Token {TOKEN}',
    'Accept': 'application/json'
}

def test_api(name, endpoint, data=None):
    """通用测试函数"""
    url = f"{BASE_URL}{endpoint}"
    print(f"🚀 正在测试: {name}")
    try:
        # 按照之前 View 的定义，统一使用 POST 请求
        response = requests.post(url, data=data, headers=HEADERS)
        
        if response.status_code == 200:
            res_json = response.json()
            if res_json.get('status') == 0:
                print(f"✅ 成功 | 返回数据条数: {len(str(res_json.get('data')))}")
            else:
                print(f"❌ 业务逻辑错误 | {res_json.get('msg')}")
        else:
            print(f"💥 HTTP 错误 | 状态码: {response.status_code} | {response.text}")
    except Exception as e:
        print(f"⚠️ 请求异常: {str(e)}")
    print("-" * 50)

# ================= 接口调用流水线 =================

if __name__ == "__main__":
    print("🌟 开始执行要素化交易大盘接口测试...\n")

    # 1. 全局与交易统计
    test_api("总盘概览数据", "/get_global_overview_data/")
    test_api("实时交易统计", "/get_realtime_trade_stats/")

    # 2. 数据大盘板块
    test_api("数据大盘-总览", "/get_data_market_overview/")
    test_api("数据大盘-分类统计", "/get_data_category_stats/")
    test_api("数据大盘-详情列表", "/get_data_detail_list/", data={'category': '医疗', 'limit': 5})

    # 3. 算力大盘板块
    test_api("算力大盘-总览", "/get_compute_market_overview/")
    test_api("算力大盘-分类统计", "/get_compute_category_stats/")
    test_api("算力大盘-详情明细", "/get_compute_node_details/", data={'gpu_model': 'A100'})

    # 4. 模型大盘板块
    test_api("模型大盘-总览", "/get_model_market_overview/")
    test_api("模型大盘-分类统计", "/get_model_category_stats/")
    test_api("模型大盘-资产明细", "/get_model_asset_details/", data={'task_type': '文本生成'})

    print("\n🏁 所有接口测试执行完毕。")