import { TooltipProvider } from "@/components/ui/tooltip"
import { useRoute } from "./app/router"
import { Product } from "./ollopa/Product"
import { Lesson } from "./learn/Lesson"
import { Site } from "./site/Site"
import { Tokens } from "./site/Tokens"

// Three surfaces from one static build (PLAN.md §2 "What we deploy"):
//   #/ollopa/…   the product      #/learn/<case>?step=N   a lesson      everything else   the library site
//   #/design     the token sheet: every colour that means something, with its name (DESIGN.md §5)
export default function App() {
  const route = useRoute()
  const top = route.path[0]
  return (
    <TooltipProvider>
      {top === "ollopa" ? <Product /> : top === "learn" ? <Lesson /> : top === "design" ? <Tokens /> : <Site />}
    </TooltipProvider>
  )
}
