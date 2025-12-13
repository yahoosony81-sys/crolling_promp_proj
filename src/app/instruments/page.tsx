import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Supabase에서 instruments 데이터를 가져오는 Server Component
 * 
 * 이 예제는 Supabase 공식 문서의 모범 사례를 따릅니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    console.error("Error fetching instruments:", error);
    return (
      <div className="p-4 text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>데이터가 없습니다.</p>
        <p className="text-sm mt-2">
          Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행하세요:
        </p>
        <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-x-auto">
          {`-- Create the table
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert some sample data
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello');

-- Enable RLS
alter table instruments enable row level security;

-- Create RLS policy
create policy "public can read instruments"
on public.instruments
for select to anon
using (true);`}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Instruments</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: { id: number; name: string }) => (
          <li
            key={instrument.id}
            className="p-3 border rounded-md hover:bg-muted transition-colors"
          >
            <span className="font-medium">{instrument.name}</span>
            <span className="text-muted-foreground text-sm ml-2">
              (ID: {instrument.id})
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h3 className="font-semibold mb-2">Raw Data (JSON):</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Instruments 페이지
 * 
 * Supabase에서 데이터를 가져와 표시하는 예제 페이지입니다.
 * http://localhost:3000/instruments 에서 확인할 수 있습니다.
 */
export default function Instruments() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supabase Integration Example</h1>
        <p className="text-muted-foreground">
          이 페이지는 Supabase 공식 문서의 예제를 기반으로 합니다.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="p-4 text-center text-muted-foreground">
            Loading instruments...
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

