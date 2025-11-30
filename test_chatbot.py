#!/usr/bin/env python3
"""
批量測試 AI 客服機器人腳本
可以一次發送多個問題給網站並收集結果
"""

import json
import requests
import time
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

# 預設配置
DEFAULT_BASE_URL = "https://www.goldenyearsphoto.com"
DEFAULT_API_ENDPOINT = "/api/chat"
DEFAULT_MAX_WORKERS = 10  # 並發請求數量
DEFAULT_DELAY = 0.1  # 每個請求之間的延遲（秒）


class ChatbotTester:
    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        max_workers: int = DEFAULT_MAX_WORKERS,
        delay: float = DEFAULT_DELAY,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_url = f"{self.base_url}{DEFAULT_API_ENDPOINT}"
        self.max_workers = max_workers
        self.delay = delay
        self.results = []

    def send_question(
        self,
        question: str,
        question_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        source: Optional[str] = None,
        mode: str = "auto",
        page_type: str = "home",
    ) -> Dict:
        """發送單個問題到 API"""
        payload = {
            "message": question,
            "mode": mode,
            "pageType": page_type,
        }

        if source:
            payload["source"] = source
        if conversation_id:
            payload["conversationId"] = conversation_id

        headers = {
            "Content-Type": "application/json",
            "Origin": self.base_url,
        }

        start_time = time.time()
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=15,
            )
            elapsed_time = time.time() - start_time

            if response.ok:
                data = response.json()
                return {
                    "question_id": question_id or f"q_{int(time.time())}",
                    "question": question,
                    "status": "success",
                    "status_code": response.status_code,
                    "response_time": round(elapsed_time, 3),
                    "reply": data.get("reply", ""),
                    "intent": data.get("intent", ""),
                    "conversation_id": data.get("conversationId"),
                    "suggested_replies": data.get("suggestedQuickReplies", []),
                    "error": None,
                }
            else:
                return {
                    "question_id": question_id or f"q_{int(time.time())}",
                    "question": question,
                    "status": "error",
                    "status_code": response.status_code,
                    "response_time": round(elapsed_time, 3),
                    "reply": None,
                    "intent": None,
                    "conversation_id": None,
                    "suggested_replies": [],
                    "error": response.text[:500],
                }
        except requests.exceptions.Timeout:
            return {
                "question_id": question_id or f"q_{int(time.time())}",
                "question": question,
                "status": "timeout",
                "status_code": None,
                "response_time": None,
                "reply": None,
                "intent": None,
                "conversation_id": None,
                "suggested_replies": [],
                "error": "Request timeout (15s)",
            }
        except Exception as e:
            return {
                "question_id": question_id or f"q_{int(time.time())}",
                "question": question,
                "status": "error",
                "status_code": None,
                "response_time": None,
                "reply": None,
                "intent": None,
                "conversation_id": None,
                "suggested_replies": [],
                "error": str(e),
            }

    def load_questions_from_faq(self, faq_path: str, limit: Optional[int] = None) -> List[Dict]:
        """從 FAQ JSON 文件載入問題"""
        questions = []
        try:
            with open(faq_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # 遍歷所有分類
            if "categories" in data:
                for category_name, category_data in data["categories"].items():
                    if "questions" in category_data:
                        for q in category_data["questions"]:
                            questions.append({
                                "id": q.get("id", ""),
                                "question": q.get("question", ""),
                            })
                            if limit and len(questions) >= limit:
                                break
                    if limit and len(questions) >= limit:
                        break
        except Exception as e:
            print(f"❌ 載入 FAQ 文件失敗: {e}")
            return []

        return questions

    def load_questions_from_file(self, file_path: str) -> List[Dict]:
        """從 JSON 文件載入問題列表
        
        文件格式可以是：
        1. 簡單列表: ["問題1", "問題2", ...]
        2. 對象列表: [{"id": "id1", "question": "問題1"}, ...]
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, list):
                questions = []
                for i, item in enumerate(data):
                    if isinstance(item, str):
                        questions.append({
                            "id": f"custom_{i+1}",
                            "question": item,
                        })
                    elif isinstance(item, dict):
                        questions.append({
                            "id": item.get("id", f"custom_{i+1}"),
                            "question": item.get("question", item.get("message", "")),
                        })
                return questions
            else:
                print("❌ 文件格式錯誤：應該是 JSON 陣列")
                return []
        except Exception as e:
            print(f"❌ 載入問題文件失敗: {e}")
            return []

    def test_questions(
        self,
        questions: List[Dict],
        use_concurrent: bool = True,
        show_progress: bool = True,
    ) -> List[Dict]:
        """批量測試問題"""
        total = len(questions)
        results = []
        start_time = time.time()

        if use_concurrent and total > 1:
            # 使用並發請求
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(
                        self.send_question,
                        q["question"],
                        q.get("id"),
                    ): q
                    for q in questions
                }

                completed = 0
                for future in as_completed(futures):
                    result = future.result()
                    results.append(result)
                    completed += 1
                    if show_progress:
                        print(
                            f"進度: {completed}/{total} ({completed*100//total}%) - "
                            f"問題: {result['question'][:30]}... - "
                            f"狀態: {result['status']}",
                            end="\r",
                        )
                    time.sleep(self.delay)
        else:
            # 順序請求
            for i, q in enumerate(questions, 1):
                result = self.send_question(q["question"], q.get("id"))
                results.append(result)
                if show_progress:
                    print(
                        f"進度: {i}/{total} ({i*100//total}%) - "
                        f"問題: {result['question'][:30]}... - "
                        f"狀態: {result['status']}",
                        end="\r",
                    )
                time.sleep(self.delay)

        elapsed = time.time() - start_time
        if show_progress:
            print(f"\n✅ 完成！總共耗時: {elapsed:.2f} 秒")

        return results

    def save_results(self, results: List[Dict], output_path: str):
        """保存結果到 JSON 文件"""
        output = {
            "test_info": {
                "base_url": self.base_url,
                "api_url": self.api_url,
                "test_time": datetime.now().isoformat(),
                "total_questions": len(results),
            },
            "summary": self.generate_summary(results),
            "results": results,
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"📄 結果已保存到: {output_path}")

    def generate_summary(self, results: List[Dict]) -> Dict:
        """生成測試摘要"""
        total = len(results)
        success = sum(1 for r in results if r["status"] == "success")
        errors = sum(1 for r in results if r["status"] == "error")
        timeouts = sum(1 for r in results if r["status"] == "timeout")

        response_times = [
            r["response_time"] for r in results if r.get("response_time")
        ]
        avg_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )

        intents = {}
        for r in results:
            if r.get("intent"):
                intents[r["intent"]] = intents.get(r["intent"], 0) + 1

        return {
            "total": total,
            "success": success,
            "errors": errors,
            "timeouts": timeouts,
            "success_rate": f"{success*100/total:.1f}%" if total > 0 else "0%",
            "average_response_time": round(avg_response_time, 3),
            "intent_distribution": intents,
        }

    def print_summary(self, results: List[Dict]):
        """打印測試摘要"""
        summary = self.generate_summary(results)
        print("\n" + "=" * 60)
        print("📊 測試摘要")
        print("=" * 60)
        print(f"總問題數: {summary['total']}")
        print(f"成功: {summary['success']} ({summary['success_rate']})")
        print(f"錯誤: {summary['errors']}")
        print(f"超時: {summary['timeouts']}")
        print(f"平均回應時間: {summary['average_response_time']} 秒")

        if summary["intent_distribution"]:
            print("\n意圖分布:")
            for intent, count in sorted(
                summary["intent_distribution"].items(),
                key=lambda x: x[1],
                reverse=True,
            ):
                print(f"  - {intent}: {count}")

        # 顯示錯誤的問題
        error_results = [r for r in results if r["status"] != "success"]
        if error_results:
            print(f"\n❌ 失敗的問題 ({len(error_results)} 個):")
            for r in error_results[:10]:  # 只顯示前10個
                print(f"  - {r['question'][:50]}... (狀態: {r['status']})")
            if len(error_results) > 10:
                print(f"  ... 還有 {len(error_results) - 10} 個失敗的問題")


def get_default_questions() -> List[Dict]:
    """返回預設的 10 個測試問題"""
    return [
        {"id": "test_001", "question": "你好"},
        {"id": "test_002", "question": "我想拍證件照，多少錢？"},
        {"id": "test_003", "question": "如何預約？"},
        {"id": "test_004", "question": "你們的地址在哪裡？"},
        {"id": "test_005", "question": "形象照和證件照有什麼不同？"},
        {"id": "test_006", "question": "拍攝需要多久時間？"},
        {"id": "test_007", "question": "可以當天交件嗎？"},
        {"id": "test_008", "question": "我想拍全家福，要怎麼預約？"},
        {"id": "test_009", "question": "營業時間是幾點？"},
        {"id": "test_010", "question": "我想預約但沒有收到確認信"},
    ]


def get_critical_questions() -> List[Dict]:
    """返回 15 個對商家有重大影響或很難回答的問題"""
    return [
        # 投訴與負面評價
        {"id": "critical_001", "question": "我對你們的照片很不滿意，可以退費嗎？"},
        {"id": "critical_002", "question": "我朋友說你們的服務很差，真的嗎？"},
        {"id": "critical_003", "question": "我上次來拍的照片修圖修得很假，很不自然"},
        
        # 價格敏感與議價
        {"id": "critical_004", "question": "可以打折嗎？我預算只有200元"},
        {"id": "critical_005", "question": "為什麼你們比別家貴這麼多？"},
        {"id": "critical_006", "question": "我一次拍10張可以算便宜一點嗎？"},
        
        # 緊急與特殊需求
        {"id": "critical_007", "question": "我明天早上8點就要用照片，可以現在拍嗎？"},
        {"id": "critical_008", "question": "我公司需要50個人的團體照，今天可以拍嗎？"},
        {"id": "critical_009", "question": "我人在國外，可以線上修圖嗎？"},
        
        # 服務失誤與補償
        {"id": "critical_010", "question": "你們把我的照片寄錯人了，怎麼辦？"},
        {"id": "critical_011", "question": "我預約了但你們忘記了，讓我白跑一趟，要怎麼賠償？"},
        {"id": "critical_012", "question": "照片檔案損壞打不開，可以重拍嗎？"},
        
        # 競爭對手比較
        {"id": "critical_013", "question": "你們跟海馬體、天真藍比起來有什麼優勢？"},
        {"id": "critical_014", "question": "為什麼我要選你們而不是路邊快照店？"},
        
        # 法律與責任問題
        {"id": "critical_015", "question": "如果照片被盜用，你們要負責嗎？"},
    ]


def main():
    parser = argparse.ArgumentParser(
        description="批量測試 AI 客服機器人",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用範例:

1. 從 FAQ 文件載入 100 個問題:
   python test_chatbot.py --faq knowledge/faq_detailed.json --limit 100

2. 從自定義 JSON 文件載入問題:
   python test_chatbot.py --questions questions.json

3. 直接指定問題列表:
   python test_chatbot.py --questions '["問題1", "問題2", "問題3"]'

4. 使用預設 10 個問題測試:
   python test_chatbot.py

5. 使用自定義 URL 和並發數:
   python test_chatbot.py --faq knowledge/faq_detailed.json --url https://goldenyearsphoto.pages.dev --workers 5

6. 順序執行（不使用並發）:
   python test_chatbot.py --faq knowledge/faq_detailed.json --no-concurrent
        """,
    )

    parser.add_argument(
        "--url",
        default=DEFAULT_BASE_URL,
        help=f"網站基礎 URL (預設: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--faq",
        help="從 FAQ JSON 文件載入問題 (例如: knowledge/faq_detailed.json)",
    )
    parser.add_argument(
        "--questions",
        help="問題 JSON 文件路徑或 JSON 字串陣列",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="限制問題數量 (僅用於 --faq)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_MAX_WORKERS,
        help=f"並發請求數量 (預設: {DEFAULT_MAX_WORKERS})",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_DELAY,
        help=f"請求之間的延遲秒數 (預設: {DEFAULT_DELAY})",
    )
    parser.add_argument(
        "--no-concurrent",
        action="store_true",
        help="不使用並發，順序執行請求",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="輸出文件路徑 (預設: test_results_YYYYMMDD_HHMMSS.json)",
    )
    parser.add_argument(
        "--no-progress",
        action="store_true",
        help="不顯示進度",
    )
    parser.add_argument(
        "--critical",
        action="store_true",
        help="使用 15 個高風險/難回答的問題進行測試",
    )

    args = parser.parse_args()

    # 初始化測試器
    tester = ChatbotTester(
        base_url=args.url,
        max_workers=args.workers,
        delay=args.delay,
    )

    # 載入問題
    questions = []
    if args.critical:
        print("⚠️  使用 15 個高風險/難回答的問題進行測試")
        questions = get_critical_questions()
    elif args.faq:
        print(f"📖 從 FAQ 文件載入問題: {args.faq}")
        questions = tester.load_questions_from_faq(args.faq, args.limit)
    elif args.questions:
        # 嘗試解析為 JSON 字串
        try:
            questions_data = json.loads(args.questions)
            if isinstance(questions_data, list):
                questions = [
                    {
                        "id": f"q_{i+1}",
                        "question": q if isinstance(q, str) else q.get("question", ""),
                    }
                    for i, q in enumerate(questions_data)
                ]
            else:
                print("❌ --questions 應該是 JSON 陣列")
                sys.exit(1)
        except json.JSONDecodeError:
            # 如果不是 JSON 字串，當作文件路徑
            print(f"📖 從文件載入問題: {args.questions}")
            questions = tester.load_questions_from_file(args.questions)
    else:
        # 使用預設問題
        print("📝 使用預設的 10 個測試問題")
        questions = get_default_questions()

    if not questions:
        print("❌ 沒有載入到任何問題")
        sys.exit(1)

    print(f"✅ 載入了 {len(questions)} 個問題")
    print(f"🌐 API URL: {tester.api_url}")
    print(f"⚙️  並發數: {args.workers if not args.no_concurrent else 1}")
    print()

    # 執行測試
    results = tester.test_questions(
        questions,
        use_concurrent=not args.no_concurrent,
        show_progress=not args.no_progress,
    )

    # 顯示摘要
    tester.print_summary(results)

    # 保存結果
    if args.output:
        output_path = args.output
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"test_results_{timestamp}.json"

    tester.save_results(results, output_path)


if __name__ == "__main__":
    main()

