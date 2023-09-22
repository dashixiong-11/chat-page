import { useShowToast } from '@/hooks/useShowToast/useShowToast'
import './Home.scss'

function Home  () {
  const {showToast} = useShowToast()

  return <div className="home">
    <button  onClick={()=>showToast({messages:'123'})}>button</button>
  </div>
}

export default Home