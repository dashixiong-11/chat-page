import { ChangeEventHandler } from 'react';
import './Select.scss';


type PropType = {
  data: { text: string, value: string }[],
  onSelected?: ChangeEventHandler<HTMLSelectElement>
}
export const Select = ({ data, onSelected }: PropType) => {

  return (<>
    {
      data &&
      <select onChange={onSelected}>
        {data.map((item, key) => <option key={key} value={item.value}>{item.text}</option>)}
      </select>
    }
  </>)
}