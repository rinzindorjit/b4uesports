export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-4">Simple Test Page</h1>
        <p className="text-muted-foreground mb-6">
          This is a simple test page to verify that React components are rendering correctly.
        </p>
        <div className="bg-red-500 text-white p-4 rounded">
          If you can see this red box, the component is rendering correctly.
        </div>
      </div>
    </div>
  );
}