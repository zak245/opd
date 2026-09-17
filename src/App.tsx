import { TooltipProvider } from "@/components/ui/tooltip"
import { useRoute } from "./app/router"
import { Product } from "./ollopa/Product"
import { Lesson } from "./learn/Lesson"
import { Site } from "./site/Site"

// Three surfaces from one static build (PLAN.md §2 "What we deploy"):
//   #/ollopa/…   the product      #/learn/<case>?step=N   a lesson      everything else   the library site
export default function App() {
  const route = useRoute()
  const top = route.path[0]
  return (
    <TooltipProvider>
      {top === "ollopa" ? <Product /> : top === "learn" ? <Lesson /> : <Site />}
    </TooltipProvider>
  )
}
