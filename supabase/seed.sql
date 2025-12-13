-- =========================================================
-- TrendScrape Prompt MVP 초기 데이터 시딩
-- =========================================================
-- 설명: 개발 및 테스트를 위한 샘플 데이터 추가
-- 실행: supabase db reset 시 자동 실행 또는 수동 실행

-- 기존 데이터 삭제 (시딩 재실행 시 중복 방지)
-- 주의: 프로덕션에서는 이 부분을 제거하거나 조건부로 실행해야 함
TRUNCATE TABLE public.pack_prompts CASCADE;
TRUNCATE TABLE public.scraped_items CASCADE;
TRUNCATE TABLE public.prompt_usages CASCADE;
TRUNCATE TABLE public.trend_packs CASCADE;
TRUNCATE TABLE public.prompt_templates CASCADE;

-- =========================================================
-- 1. 무료 프롬프트 템플릿 10개 생성
-- =========================================================

-- 1-1. 블로그 글 작성 프롬프트 (blog)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '블로그 글 초안 생성', '주제와 타겟 독자를 입력하면 SEO 최적화된 블로그 글 초안을 생성합니다.', 'blog', 
'당신은 전문 블로그 작가입니다. 다음 주제와 타겟 독자를 바탕으로 SEO 최적화된 블로그 글 초안을 작성해주세요.

주제: {topic}
타겟 독자: {target_audience}
글의 톤: {tone}
예상 글자 수: {word_count}

요구사항:
- 독자의 문제를 명확히 파악하고 해결책 제시
- 검색 최적화를 위한 키워드 자연스럽게 포함
- 읽기 쉬운 구조 (소제목 활용)
- 실제 사례나 데이터 인용
- 마무리는 행동 유도(CTA) 포함

블로그 글을 작성해주세요.',
'[{"name": "topic", "description": "블로그 글의 주제", "example": "겨울 패션 트렌드"}, {"name": "target_audience", "description": "타겟 독자층", "example": "20-30대 여성"}, {"name": "tone", "description": "글의 톤앤매너", "example": "친근하고 전문적인"}, {"name": "word_count", "description": "예상 글자 수", "example": "2000자"}]'::jsonb,
'{"topic": "겨울 패션 트렌드", "target_audience": "20-30대 여성", "tone": "친근하고 전문적인", "word_count": "2000자"}'::jsonb),

(true, '제품 리뷰 블로그 글', '제품을 사용한 경험을 바탕으로 솔직하고 유용한 리뷰 글을 작성합니다.', 'blog',
'당신은 제품 리뷰 전문 블로거입니다. 다음 정보를 바탕으로 솔직하고 유용한 제품 리뷰 글을 작성해주세요.

제품명: {product_name}
카테고리: {category}
사용 기간: {usage_period}
주요 특징: {features}
장점: {pros}
단점: {cons}
가격대: {price_range}

요구사항:
- 실제 사용 경험 기반의 솔직한 평가
- 구체적인 사용 사례 포함
- 타겟 고객에게 도움이 되는 정보 제공
- 비교 분석 (경쟁 제품과의 차이점)
- 구매 결정에 도움이 되는 결론

리뷰 글을 작성해주세요.',
'[{"name": "product_name", "description": "리뷰할 제품명", "example": "아이폰 15 Pro"}, {"name": "category", "description": "제품 카테고리", "example": "스마트폰"}, {"name": "usage_period", "description": "사용 기간", "example": "3개월"}, {"name": "features", "description": "주요 특징", "example": "타이타늄 소재, A17 Pro 칩"}, {"name": "pros", "description": "장점", "example": "배터리 수명, 카메라 성능"}, {"name": "cons", "description": "단점", "example": "가격, 무게"}, {"name": "price_range", "description": "가격대", "example": "150만원대"}]'::jsonb,
'{"product_name": "아이폰 15 Pro", "category": "스마트폰", "usage_period": "3개월", "features": "타이타늄 소재, A17 Pro 칩", "pros": "배터리 수명, 카메라 성능", "cons": "가격, 무게", "price_range": "150만원대"}'::jsonb),

(true, '트렌드 분석 블로그 글', '최신 트렌드를 분석하고 독자에게 인사이트를 제공하는 글을 작성합니다.', 'blog',
'당신은 트렌드 분석 전문가입니다. 다음 트렌드에 대해 심층 분석 글을 작성해주세요.

트렌드 주제: {trend_topic}
관련 산업/분야: {industry}
트렌드 발생 배경: {background}
주요 플레이어: {key_players}
예상 전망: {forecast}

요구사항:
- 트렌드의 발생 배경과 원인 분석
- 관련 산업에 미치는 영향
- 주요 기업/브랜드의 대응 전략
- 향후 전망과 기회 포인트
- 독자가 활용할 수 있는 실용적 조언

트렌드 분석 글을 작성해주세요.',
'[{"name": "trend_topic", "description": "분석할 트렌드 주제", "example": "AI 챗봇 활용 확대"}, {"name": "industry", "description": "관련 산업", "example": "고객 서비스, 마케팅"}, {"name": "background", "description": "트렌드 발생 배경", "example": "ChatGPT 등장 이후"}, {"name": "key_players", "description": "주요 플레이어", "example": "OpenAI, 구글, 마이크로소프트"}, {"name": "forecast", "description": "예상 전망", "example": "향후 2-3년 내 대규모 확산 예상"}]'::jsonb,
'{"trend_topic": "AI 챗봇 활용 확대", "industry": "고객 서비스, 마케팅", "background": "ChatGPT 등장 이후", "key_players": "OpenAI, 구글, 마이크로소프트", "forecast": "향후 2-3년 내 대규모 확산 예상"}'::jsonb);

-- 1-2. 유튜브 숏츠 스크립트 (shorts)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '유튜브 숏츠 30초 스크립트', '30초 이내로 시청자의 관심을 끌 수 있는 숏츠 스크립트를 생성합니다.', 'shorts',
'당신은 유튜브 숏츠 전문 작가입니다. 다음 정보를 바탕으로 30초 이내의 강력한 숏츠 스크립트를 작성해주세요.

주제: {topic}
핵심 메시지: {core_message}
타겟 시청자: {target_viewer}
훅(첫 3초): {hook}
CTA(행동 유도): {cta}

요구사항:
- 첫 3초 안에 시청자의 관심을 확실히 끌기
- 핵심 메시지를 명확하고 간결하게 전달
- 시각적 요소를 고려한 설명 (예: "화면에 보이는 것처럼...")
- 자연스러운 흐름과 리듬감
- 마지막에 강력한 CTA 포함

숏츠 스크립트를 작성해주세요.',
'[{"name": "topic", "description": "숏츠 주제", "example": "겨울철 다이어트 팁"}, {"name": "core_message", "description": "전달할 핵심 메시지", "example": "겨울에도 쉽게 할 수 있는 실용적인 다이어트 방법"}, {"name": "target_viewer", "description": "타겟 시청자", "example": "20-30대 여성"}, {"name": "hook", "description": "첫 3초 훅", "example": "겨울에 살이 찐다고 생각하세요? 오해입니다!"}, {"name": "cta", "description": "행동 유도", "example": "좋아요와 구독으로 응원해주세요"}]'::jsonb,
'{"topic": "겨울철 다이어트 팁", "core_message": "겨울에도 쉽게 할 수 있는 실용적인 다이어트 방법", "target_viewer": "20-30대 여성", "hook": "겨울에 살이 찐다고 생각하세요? 오해입니다!", "cta": "좋아요와 구독으로 응원해주세요"}'::jsonb),

(true, '제품 소개 숏츠 스크립트', '제품의 핵심 가치를 빠르게 전달하는 숏츠 스크립트를 작성합니다.', 'shorts',
'당신은 제품 마케팅 전문가입니다. 다음 제품을 30초 안에 효과적으로 소개하는 숏츠 스크립트를 작성해주세요.

제품명: {product_name}
핵심 가치: {core_value}
주요 특징 (3가지): {features}
타겟 고객: {target_customer}
차별화 포인트: {differentiator}

요구사항:
- 제품의 핵심 가치를 즉시 전달
- 시각적으로 보여주기 좋은 특징 강조
- 고객의 문제를 해결하는 방식으로 접근
- 경쟁 제품과의 차별점 명확히
- 구매 링크나 액션 유도

숏츠 스크립트를 작성해주세요.',
'[{"name": "product_name", "description": "제품명", "example": "무선 이어폰 Pro"}, {"name": "core_value", "description": "핵심 가치", "example": "편리함과 고음질"}, {"name": "features", "description": "주요 특징 3가지", "example": "노이즈 캔슬링, 30시간 배터리, 방수"}, {"name": "target_customer", "description": "타겟 고객", "example": "운동하는 사람, 통근자"}, {"name": "differentiator", "description": "차별화 포인트", "example": "가격 대비 최고의 성능"}]'::jsonb,
'{"product_name": "무선 이어폰 Pro", "core_value": "편리함과 고음질", "features": "노이즈 캔슬링, 30시간 배터리, 방수", "target_customer": "운동하는 사람, 통근자", "differentiator": "가격 대비 최고의 성능"}'::jsonb);

-- 1-3. 인스타그램 릴스 스크립트 (reels)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '인스타그램 릴스 스크립트 (15초)', '15초 안에 강렬한 임팩트를 주는 인스타그램 릴스 스크립트를 생성합니다.', 'reels',
'당신은 인스타그램 릴스 전문 크리에이터입니다. 다음 정보로 15초 릴스 스크립트를 작성해주세요.

콘셉트: {concept}
핵심 메시지: {message}
비주얼 아이디어: {visual_idea}
해시태그 컨셉: {hashtag_concept}
타겟 팔로워: {target_follower}

요구사항:
- 첫 1초부터 강렬한 시각적 임팩트
- 짧고 강력한 문구 사용
- 트렌디하고 공유하기 좋은 내용
- 자연스러운 전환과 리듬감
- 마지막에 해시태그나 팔로우 유도

릴스 스크립트를 작성해주세요.',
'[{"name": "concept", "description": "릴스 콘셉트", "example": "일상 속 발견"}, {"name": "message", "description": "핵심 메시지", "example": "작은 것에서 행복 찾기"}, {"name": "visual_idea", "description": "비주얼 아이디어", "example": "카페 창가 풍경, 손글씨"}, {"name": "hashtag_concept", "description": "해시태그 컨셉트", "example": "#일상 #행복 #카페"}, {"name": "target_follower", "description": "타겟 팔로워", "example": "20-30대 여성"}]'::jsonb,
'{"concept": "일상 속 발견", "message": "작은 것에서 행복 찾기", "visual_idea": "카페 창가 풍경, 손글씨", "hashtag_concept": "#일상 #행복 #카페", "target_follower": "20-30대 여성"}'::jsonb);

-- 1-4. 상품 분석 프롬프트 (product)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '온라인 쇼핑몰 상품 분석', '온라인 쇼핑몰에서 판매할 상품의 시장성과 경쟁력을 분석합니다.', 'product',
'당신은 전자상거래 상품 분석 전문가입니다. 다음 상품에 대해 종합적인 분석을 제공해주세요.

상품명: {product_name}
카테고리: {category}
타겟 가격대: {target_price}
경쟁 상품: {competitors}
시장 트렌드: {market_trend}

요구사항:
- 시장 규모와 성장 가능성 분석
- 경쟁 상품과의 비교 분석 (가격, 품질, 특징)
- 타겟 고객층의 니즈 분석
- 마진율과 수익성 예측
- 마케팅 전략 제안
- 리스크 요소와 대응 방안

상품 분석 보고서를 작성해주세요.',
'[{"name": "product_name", "description": "분석할 상품명", "example": "무선 충전기 스탠드"}, {"name": "category", "description": "상품 카테고리", "example": "전자기기 액세서리"}, {"name": "target_price", "description": "타겟 가격대", "example": "3-5만원"}, {"name": "competitors", "description": "주요 경쟁 상품", "example": "삼성, 애플 공식 충전기"}, {"name": "market_trend", "description": "시장 트렌드", "example": "무선 충전 수요 증가"}]'::jsonb,
'{"product_name": "무선 충전기 스탠드", "category": "전자기기 액세서리", "target_price": "3-5만원", "competitors": "삼성, 애플 공식 충전기", "market_trend": "무선 충전 수요 증가"}'::jsonb),

(true, '제품 리서치 및 비교 분석', '여러 제품을 비교하여 최적의 선택을 도와주는 분석을 제공합니다.', 'product',
'당신은 제품 리서치 전문가입니다. 다음 제품들을 비교 분석하여 구매 결정에 도움을 주는 리포트를 작성해주세요.

비교할 제품들: {products}
비교 기준: {criteria}
예산 범위: {budget}
주요 사용 목적: {usage_purpose}
우선순위: {priorities}

요구사항:
- 각 제품의 장단점 명확히 정리
- 가격 대비 성능 비교
- 사용 목적에 맞는 적합도 평가
- 구매 시 고려사항 제시
- 최종 추천 제품과 이유 명시

제품 비교 분석 리포트를 작성해주세요.',
'[{"name": "products", "description": "비교할 제품 목록", "example": "아이폰 15, 갤럭시 S24, 픽셀 8"}, {"name": "criteria", "description": "비교 기준", "example": "가격, 성능, 카메라, 배터리"}, {"name": "budget", "description": "예산 범위", "example": "100-150만원"}, {"name": "usage_purpose", "description": "주요 사용 목적", "example": "사진 촬영, 게임, 업무"}, {"name": "priorities", "description": "우선순위", "example": "카메라 > 배터리 > 가격"}]'::jsonb,
'{"products": "아이폰 15, 갤럭시 S24, 픽셀 8", "criteria": "가격, 성능, 카메라, 배터리", "budget": "100-150만원", "usage_purpose": "사진 촬영, 게임, 업무", "priorities": "카메라 > 배터리 > 가격"}'::jsonb);

-- 1-5. 트렌드 요약 프롬프트 (trend)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '주간 트렌드 요약', '한 주간의 주요 트렌드를 간결하게 요약하고 인사이트를 제공합니다.', 'trend',
'당신은 트렌드 분석 전문가입니다. 다음 주간 트렌드를 요약하고 분석해주세요.

트렌드 주제: {trend_topic}
관련 분야: {related_fields}
주요 키워드: {keywords}
발생 시기: {time_period}
영향 범위: {impact_scope}

요구사항:
- 트렌드의 핵심 내용을 간결하게 요약
- 왜 지금 주목받는지 배경 설명
- 관련 산업/분야에 미치는 영향
- 향후 전망과 기회 포인트
- 실용적인 활용 방안 제시

트렌드 요약 리포트를 작성해주세요.',
'[{"name": "trend_topic", "description": "트렌드 주제", "example": "AI 음성 비서 확산"}, {"name": "related_fields", "description": "관련 분야", "example": "스마트홈, 자동차, 고객 서비스"}, {"name": "keywords", "description": "주요 키워드", "example": "ChatGPT Voice, 음성 AI, 스마트 스피커"}, {"name": "time_period", "description": "발생 시기", "example": "2024년 11월"}, {"name": "impact_scope", "description": "영향 범위", "example": "전자제품, 서비스업 전반"}]'::jsonb,
'{"trend_topic": "AI 음성 비서 확산", "related_fields": "스마트홈, 자동차, 고객 서비스", "keywords": "ChatGPT Voice, 음성 AI, 스마트 스피커", "time_period": "2024년 11월", "impact_scope": "전자제품, 서비스업 전반"}'::jsonb),

(true, '시장 트렌드 분석 및 예측', '특정 시장의 트렌드를 분석하고 향후 전망을 제시합니다.', 'trend',
'당신은 시장 분석 전문가입니다. 다음 시장 트렌드를 분석하고 예측해주세요.

시장 분야: {market_field}
분석 기간: {analysis_period}
주요 변화: {key_changes}
주요 플레이어: {key_players}
시장 규모: {market_size}

요구사항:
- 시장의 현재 상태와 주요 변화 분석
- 성장 동력과 제약 요인 파악
- 주요 기업/브랜드의 전략 분석
- 향후 1-2년 전망
- 투자/진입 기회 포인트
- 리스크 요소와 대응 방안

시장 트렌드 분석 리포트를 작성해주세요.',
'[{"name": "market_field", "description": "시장 분야", "example": "전기차 시장"}, {"name": "analysis_period", "description": "분석 기간", "example": "2024년 하반기"}, {"name": "key_changes", "description": "주요 변화", "example": "배터리 기술 발전, 충전 인프라 확대"}, {"name": "key_players", "description": "주요 플레이어", "example": "테슬라, 현대, 기아"}, {"name": "market_size", "description": "시장 규모", "example": "연간 100만대 이상"}]'::jsonb,
'{"market_field": "전기차 시장", "analysis_period": "2024년 하반기", "key_changes": "배터리 기술 발전, 충전 인프라 확대", "key_players": "테슬라, 현대, 기아", "market_size": "연간 100만대 이상"}'::jsonb);

-- 1-6. 주식 분석 프롬프트 (stock)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '주식 투자 분석', '특정 종목의 투자 가치를 분석하고 의견을 제시합니다. (투자 조언이 아닌 정보 제공 목적)', 'stock',
'당신은 주식 분석 전문가입니다. 다음 종목에 대해 객관적인 분석을 제공해주세요. (참고용 정보 제공, 실제 투자 결정은 본인의 판단 필요)

종목명: {stock_name}
업종: {sector}
현재가: {current_price}
분석 관점: {analysis_angle}
관심 키워드: {keywords}

요구사항:
- 회사 개요 및 사업 모델 설명
- 재무제표 주요 지표 분석 (매출, 영업이익, ROE 등)
- 업종 내 경쟁력과 포지셔닝
- 최근 뉴스 및 이슈 분석
- 기술적 분석 (차트 패턴, 거래량 등)
- 리스크 요소와 기회 포인트
- 투자 의견 (매수/보유/매도) 및 근거

주식 분석 리포트를 작성해주세요. (면책: 이는 정보 제공 목적이며, 실제 투자 결정은 본인의 책임입니다.)',
'[{"name": "stock_name", "description": "분석할 종목명", "example": "삼성전자"}, {"name": "sector", "description": "업종", "example": "반도체, IT"}, {"name": "current_price", "description": "현재가", "example": "70,000원"}, {"name": "analysis_angle", "description": "분석 관점", "example": "중장기 투자 가치"}, {"name": "keywords", "description": "관심 키워드", "example": "메모리 반도체, AI 반도체"}]'::jsonb,
'{"stock_name": "삼성전자", "sector": "반도체, IT", "current_price": "70,000원", "analysis_angle": "중장기 투자 가치", "keywords": "메모리 반도체, AI 반도체"}'::jsonb);

-- 1-7. 부동산 분석 프롬프트 (real_estate)
INSERT INTO public.prompt_templates (is_free, title, description, category, content, variables, example_inputs)
VALUES 
(true, '부동산 시장 분석', '특정 지역의 부동산 시장 상황을 분석하고 전망을 제시합니다.', 'real_estate',
'당신은 부동산 시장 분석 전문가입니다. 다음 지역의 부동산 시장을 분석해주세요.

지역: {location}
부동산 유형: {property_type}
분석 관점: {analysis_angle}
관심 사항: {interests}

요구사항:
- 지역 개요 및 입지 조건 분석
- 최근 가격 동향 및 거래량 추이
- 공급 및 수요 상황 분석
- 개발 계획 및 인프라 현황
- 투자 수익성 분석 (임대 수익률 등)
- 향후 전망 및 리스크 요소
- 투자/거주 시 고려사항

부동산 시장 분석 리포트를 작성해주세요.',
'[{"name": "location", "description": "분석할 지역", "example": "강남구 역삼동"}, {"name": "property_type", "description": "부동산 유형", "example": "아파트, 오피스텔"}, {"name": "analysis_angle", "description": "분석 관점", "example": "투자 가치, 거주 적합성"}, {"name": "interests", "description": "관심 사항", "example": "가격 전망, 개발 계획"}]'::jsonb,
'{"location": "강남구 역삼동", "property_type": "아파트, 오피스텔", "analysis_angle": "투자 가치, 거주 적합성", "interests": "가격 전망, 개발 계획"}'::jsonb);

-- =========================================================
-- 2. 샘플 트렌드 패키지 생성
-- =========================================================

-- 변수에 패키지 ID 저장을 위한 임시 테이블 사용
DO $$
DECLARE
  pack1_id uuid;
  pack2_id uuid;
BEGIN
  -- 패키지 1: 겨울 패션 트렌드 (product 카테고리)
  INSERT INTO public.trend_packs (week_key, category, title, summary, trend_keywords, status, generated_at)
  VALUES (
    '2025-W50',
    'product',
    '2025 겨울 패션 트렌드',
    '2025년 겨울을 장식할 주요 패션 트렌드가 부상하고 있습니다. 지속가능성과 실용성을 중시하는 트렌드가 두드러지며, 특히 겨울 아우터와 액세서리 시장에서 혁신적인 디자인이 주목받고 있습니다.',
    ARRAY['지속가능 패션', '리사이클 소재', '오버사이즈 코트', '스니커즈 부츠', '빈티지 액세서리'],
    'published',
    NOW()
  )
  RETURNING id INTO pack1_id;

  -- 패키지 2: AI 콘텐츠 제작 트렌드 (blog 카테고리)
  INSERT INTO public.trend_packs (week_key, category, title, summary, trend_keywords, status, generated_at)
  VALUES (
    '2025-W50',
    'blog',
    'AI 기반 콘텐츠 제작 트렌드',
    'AI 도구를 활용한 콘텐츠 제작이 급속히 확산되고 있습니다. 블로거와 콘텐츠 크리에이터들이 AI를 활용해 효율성을 높이면서도 창의성을 유지하는 방법을 모색하고 있습니다.',
    ARRAY['ChatGPT', 'AI 글쓰기', '콘텐츠 자동화', 'SEO 최적화', '개인화 콘텐츠'],
    'published',
    NOW()
  )
  RETURNING id INTO pack2_id;

  -- =========================================================
  -- 3. Scraped Items 데이터 생성
  -- =========================================================

  -- 패키지 1의 스크랩 아이템들
  INSERT INTO public.scraped_items (pack_id, source_domain, source_type, url, title, summary, tags, extracted_data)
  VALUES
  (pack1_id, 'naver.com', 'blog', 'https://blog.naver.com/fashion/2025-winter-trend', 
   '2025 겨울 패션, 지속가능성이 핵심 키워드',
   '패션 업계가 지속가능성을 중시하는 트렌드로 전환하고 있습니다. 리사이클 소재를 활용한 겨울 아우터가 인기를 끌고 있으며, 소비자들도 환경을 고려한 구매를 선호하는 추세입니다.',
   ARRAY['지속가능 패션', '리사이클', '겨울 아우터'],
   '{"price_range": "10-50만원", "popular_brands": ["에코브랜드", "리사이클 전문 브랜드"]}'::jsonb),

  (pack1_id, 'coupang.com', 'market', 'https://www.coupang.com/vp/products/winter-fashion-trend',
   '쿠팡 겨울 패션 트렌드 리포트',
   '온라인 쇼핑몰 데이터 분석 결과, 오버사이즈 코트와 스니커즈 부츠의 검색량이 전년 대비 200% 증가했습니다. 특히 20-30대 여성층에서 높은 관심을 보이고 있습니다.',
   ARRAY['오버사이즈 코트', '스니커즈 부츠', '겨울 신발'],
   '{"search_increase": "200%", "target_age": "20-30대", "gender": "여성"}'::jsonb),

  (pack1_id, 'news.site', 'news', 'https://news.site/fashion/2025-winter-trend-analysis',
   '패션 전문가가 분석한 2025 겨울 트렌드',
   '패션 전문가들은 올 겨울 빈티지 스타일의 부활과 미니멀리즘의 조화를 예측합니다. 클래식한 디자인에 현대적인 실용성을 더한 아이템들이 주목받을 것으로 전망됩니다.',
   ARRAY['빈티지', '미니멀리즘', '클래식 디자인'],
   '{"expert_opinion": "클래식과 모던의 조화", "key_items": ["빈티지 코트", "미니멀 액세서리"]}'::jsonb),

  (pack1_id, 'community.site', 'community', 'https://community.site/fashion/winter-trend-discussion',
   '소셜 커뮤니티에서 주목받는 겨울 패션 아이템',
   '온라인 커뮤니티에서 겨울 패션 관련 토론이 활발합니다. 실용성과 스타일을 모두 갖춘 아이템에 대한 수요가 높으며, 특히 가성비 좋은 제품에 대한 관심이 집중되고 있습니다.',
   ARRAY['가성비', '실용성', '스타일'],
   '{"discussion_topics": ["가성비 아이템", "스타일링 팁"], "engagement": "높음"}'::jsonb);

  -- 패키지 2의 스크랩 아이템들
  INSERT INTO public.scraped_items (pack_id, source_domain, source_type, url, title, summary, tags, extracted_data)
  VALUES
  (pack2_id, 'naver.com', 'blog', 'https://blog.naver.com/tech/ai-content-creation',
   'AI로 블로그 글쓰기 효율 300% 높이기',
   'ChatGPT와 같은 AI 도구를 활용해 블로그 글 작성 시간을 크게 단축할 수 있습니다. 하지만 AI의 한계를 이해하고 인간의 창의성을 더하는 것이 중요합니다.',
   ARRAY['ChatGPT', 'AI 글쓰기', '블로그', '효율성'],
   '{"efficiency_increase": "300%", "tools": ["ChatGPT", "Claude", "Notion AI"]}'::jsonb),

  (pack2_id, 'news.site', 'news', 'https://news.site/tech/ai-content-trend-2025',
   '2025년 AI 콘텐츠 제작 시장 전망',
   'AI 기반 콘텐츠 제작 도구 시장이 급성장하고 있습니다. 특히 SEO 최적화와 개인화 콘텐츠 생성 기능이 주목받고 있으며, 중소기업과 개인 크리에이터들의 활용이 증가하고 있습니다.',
   ARRAY['AI 콘텐츠', 'SEO', '개인화', '콘텐츠 마케팅'],
   '{"market_growth": "연평균 40%", "key_features": ["SEO 최적화", "개인화"]}'::jsonb),

  (pack2_id, 'community.site', 'community', 'https://community.site/bloggers/ai-tools-review',
   '블로거들이 추천하는 AI 콘텐츠 도구 베스트 5',
   '실제 블로거들이 사용하고 추천하는 AI 도구들을 모았습니다. 글 작성부터 SEO 최적화, 이미지 생성까지 다양한 기능을 제공하는 도구들이 소개되었습니다.',
   ARRAY['AI 도구', '블로거 추천', '콘텐츠 제작'],
   '{"top_tools": ["ChatGPT", "Jasper", "Copy.ai", "Grammarly", "Canva AI"], "user_rating": "4.5/5"}'::jsonb);

  -- =========================================================
  -- 4. Pack-Prompt 연결 데이터 생성
  -- =========================================================

  -- 패키지 1 (겨울 패션)에 연결할 프롬프트들
  -- 상품 분석 프롬프트 2개 연결
  INSERT INTO public.pack_prompts (pack_id, prompt_id, sort_order)
  SELECT pack1_id, id, ROW_NUMBER() OVER (ORDER BY created_at)
  FROM public.prompt_templates
  WHERE category = 'product' AND is_free = true
  LIMIT 2;

  -- 트렌드 요약 프롬프트 1개 연결
  INSERT INTO public.pack_prompts (pack_id, prompt_id, sort_order)
  SELECT pack1_id, id, 3
  FROM public.prompt_templates
  WHERE category = 'trend' AND is_free = true
  LIMIT 1;

  -- 패키지 2 (AI 콘텐츠)에 연결할 프롬프트들
  -- 블로그 글 작성 프롬프트 2개 연결
  INSERT INTO public.pack_prompts (pack_id, prompt_id, sort_order)
  SELECT pack2_id, id, ROW_NUMBER() OVER (ORDER BY created_at)
  FROM public.prompt_templates
  WHERE category = 'blog' AND is_free = true
  LIMIT 2;

  -- 트렌드 요약 프롬프트 1개 연결
  INSERT INTO public.pack_prompts (pack_id, prompt_id, sort_order)
  SELECT pack2_id, id, 3
  FROM public.prompt_templates
  WHERE category = 'trend' AND is_free = true
  LIMIT 1;

END $$;

