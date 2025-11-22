#!/usr/bin/env python3
"""
获取所有商品列表
Usage: python list_all_products.py
"""
import requests
import json
from typing import Dict, List

API_BASE_URL = "https://www.chimeracoffee.top:8448"


def login(username: str, password: str) -> str:
    """登录并返回 token"""
    login_url = f"{API_BASE_URL}/auth/login"
    payload = {"username": username, "password": password}

    response = requests.post(login_url, json=payload, verify=False)
    response.raise_for_status()

    data = response.json()
    if data.get("data"):
        token = data["data"]
        print(f"✓ 登录成功")
        return token
    else:
        raise Exception(f"登录失败: {data}")


def get_all_products(token: str) -> List[Dict]:
    """获取所有商品"""
    url = f"{API_BASE_URL}/product/shop"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers, verify=False)
    response.raise_for_status()

    data = response.json()
    # API 直接返回数组或者包在 data 中
    if isinstance(data, list):
        return data
    return data.get("data", [])


def main():
    import urllib3

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # 输入账号密码
    print("=" * 60)
    print("Chimera 商品列表查询工具")
    print("=" * 60)
    username = input("请输入用户名: ").strip()
    password = input("请输入密码: ").strip()

    try:
        # 登录
        token = login(username, password)

        # 获取商品
        print("\n正在获取商品列表...")
        products = get_all_products(token)

        print(f"\n找到 {len(products)} 个商品:\n")
        print("=" * 60)

        # 按商品 ID 排序
        products_sorted = sorted(products, key=lambda x: x.get("name", ""))

        for idx, product in enumerate(products_sorted, 1):
            name = product.get("name", "未知商品")
            price = product.get("price", 0) / 100  # 转换为元
            stock = product.get("stock", 0)
            status = "上架" if product.get("status") == 1 else "下架"
            only_delivery = "仅定时达" if product.get("onlyDelivery") else ""

            print(f"{idx}. {name}")
            print(
                f"   价格: {price}元 | 库存: {stock} | 状态: {status} {only_delivery}"
            )

            # 显示商品选项
            if product.get("productOptions"):
                print(f"   可选选项:")
                for option_id, option_values in product["productOptions"].items():
                    if option_values:
                        values_str = ", ".join(
                            [
                                f"{v.get('value', '?')}({v.get('priceAdjustment', 0)/100:+.0f}元)"
                                for v in option_values
                            ]
                        )
                        print(f"      - {values_str}")
            print()

        # 导出 JSON
        output_file = "products_list.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(products_sorted, f, ensure_ascii=False, indent=2)

        print("=" * 60)
        print(f"✓ 完整数据已导出到: {output_file}")

    except Exception as e:
        print(f"\n✗ 错误: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
