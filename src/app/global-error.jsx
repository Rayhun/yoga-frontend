'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="text-center py-10 px-5 max-w-md">
        <h2 className="text-2xl">Something went wrong!</h2>
        <p>{error?.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
