import { TooltipProvider } from "@/components/ui/tooltip"
import { useRoute, href } from "./app/router"
import { Product } from "./ollopa/Product"

function Library() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">OPD · Open Progressive Disclosure</h1>
      <p className="mt-2 text-muted-foreground">A case library. The site around it comes later in the build.</p>
      <ul className="mt-6 list-disc pl-5 text-sm">
        <li><a className="underline" href={href("/ollopa")}>Open Ollopa</a>, the product every case is built on.</li>
      </ul>
    </main>
  )
}

export default function App() {
  const route = useRoute()
  const top = route.path[0]
  return (
    <TooltipProvider>
      {top === "ollopa" ? <Product /> : top === "learn" ? <main className="p-8 text-sm text-muted-foreground">Lessons are being built.</main> : <Library />}
    </TooltipProvider>
  )
}
