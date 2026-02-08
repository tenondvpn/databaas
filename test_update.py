import pymysql
import time
import random
from datetime import datetime

# --- 数据库配置 ---
DB_CONFIG = {
    'host': '82.156.224.174',
    'user': 'root',
    'password': 'Xf4aGbTaf!',
    'database': 'dags',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': True
}

def run_simulation():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print(f"🚀 大盘全线启动 | 目标数据库: {DB_CONFIG['database']}")
        
        while True:
            # 1. 【修复核心】更新中间趋势图 (trade_volume_trends)
            # 确保 labels 不为空，生成 09:00 到 15:00 的数据点
            time_points = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
            for tp in time_points:
                cursor.execute("""
                    INSERT INTO trade_volume_trends (time_point, data_volume, trade_value)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                    data_volume = data_volume + (RAND()*0.2),
                    trade_value = trade_value + (RAND()*1.5 - 0.5)
                """, (tp, random.uniform(1.5, 3.0), random.uniform(10.0, 40.0)))

            # 2. 更新顶部指标卡片 (overview_stats)
            cursor.execute("""
                UPDATE overview_stats SET 
                current_value = CASE 
                    WHEN indicator_name = '数据总量' THEN CONCAT(ROUND(3.0 + RAND()*2, 2), 'PB')
                    WHEN indicator_name = '算力总量' THEN CONCAT(ROUND(1.5 + RAND()*0.5, 2), 'EF')
                    WHEN indicator_name = '模型总量' THEN CONCAT(FLOOR(1200 + RAND()*100), '个')
                    ELSE '892个' 
                END,
                trend_rate = ROUND(-2 + RAND()*15, 2)
            """)

            # 3. 更新实时交易流水 (realtime_trades)
            # 模拟新产生的交易，并保持 10 条最新数据
            trade_names = ['电力大数据集', 'Llama3算力包', '反欺诈视觉模型', '路网监测数据', '金融研报集']
            cursor.execute("""
                INSERT INTO realtime_trades (name, category, price_label, status_text, status_color, trade_time)
                VALUES (%s, %s, %s, '交易中', '#4ade80', NOW())
            """, (random.choice(trade_names), random.choice(['数据', '算力', '模型']), 
                  f"¥{random.randint(1000, 5000)}"))
            # 删除旧数据，保持流水动态
            cursor.execute("DELETE FROM realtime_trades WHERE id NOT IN (SELECT id FROM (SELECT id FROM realtime_trades ORDER BY trade_time DESC LIMIT 10) t)")

            # 4. 更新算力负载与明细 (compute_node_details & compute_resource_overview)
            cursor.execute("""
                UPDATE compute_node_details SET 
                load_factor = ROUND(GREATEST(0, LEAST(100, load_factor + (RAND()*8 - 4))), 1),
                status = CASE WHEN load_factor > 80 THEN '忙碌' WHEN load_factor > 40 THEN '运行中' ELSE '待机' END,
                last_ping = NOW()
            """)
            cursor.execute("UPDATE compute_resource_overview SET utilization = ROUND(50 + RAND()*40, 1)")

            # 5. 更新数据大盘子趋势 (data_market_trends)
            cursor.execute("""
                UPDATE data_market_trends SET 
                data_volume = data_volume + RAND()*0.05, 
                trade_value = trade_value + RAND()*0.1
            """)

            # 6. 更新模型大盘数据 (model_asset_overview & model_market_trends)
            cursor.execute("UPDATE model_asset_overview SET rating = ROUND(4.0 + RAND(), 1)")
            cursor.execute("UPDATE model_market_trends SET active_requests = active_requests + FLOOR(RAND()*5)")

            # 7. 更新分类明细状态 (用于同步更新时间)
            cursor.execute("UPDATE data_element_detail_list SET last_update = NOW()")
            cursor.execute("UPDATE model_asset_details SET update_time = NOW(), health_score = 90 + FLOOR(RAND()*10)")

            print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔃 全量15表数据已实时同步")
            time.sleep(5)

    except Exception as e:
        print(f"❌ 运行出错: {e}")
        # 如果是连接断开，尝试重连
        time.sleep(10)
        run_simulation()
    finally:
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    run_simulation()