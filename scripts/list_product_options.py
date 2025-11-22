#!/usr/bin/env python3
"""
获取所有商品选项定义
"""
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_BASE_URL = "https://www.chimeracoffee.top:8448"

# 使用之前的登录信息
username = "yunying"
password = "cmlyy"

# 登录
login_url = f"{API_BASE_URL}/auth/login"
response = requests.post(
    login_url, json={"username": username, "password": password}, verify=False
)
token = response.json()["data"]

# 获取所有商品选项
url = f"{API_BASE_URL}/productOption"
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(url, headers=headers, verify=False)
data = response.json()

# API 可能直接返回数组
if isinstance(data, list):
    options = data
else:
    options = data.get("data", [])

print(f"找到 {len(options)} 个选项组:\n")
print("=" * 80)

for opt in options:
    print(f"\n选项名称: {opt.get('name', '未知')}")
    print(f"选项ID: {opt.get('id', 'N/A')}")
    print(f"可选值:")
    for val in opt.get("values", []):
        price_adj = val.get("priceAdjustment", 0) / 100
        print(
            f"  - {val.get('value', '?')} (UUID: {val.get('uuid', '?')}, 价格调整: {price_adj:+.1f}元)"
        )

print("\n" + "=" * 80)

# 保存到文件
with open("product_options.json", "w", encoding="utf-8") as f:
    json.dump(options, f, ensure_ascii=False, indent=2)

print(f"\n✓ 完整数据已导出到: product_options.json")
