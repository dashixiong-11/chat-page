
type PropTyep = {
  visible: boolean,
  cb: () => void
}

export const AddChannel = ({ visible, cb }: PropTyep) => {

  return visible && <>
    <div className="add-channel-model">
      <div className="col">
        <span>类型</span>
        <input type="text" className="channel-type" />
      </div>
      <div className="col">
        <span>频道名称</span>
        <input type="text" className="channel-name" />
      </div>
      <div className="col">
        <span>姓名</span>
        <input type="text" className="name" />
      </div>
      <div className="col">
        <span>年龄</span>
        <input type="text" className="age" />
      </div>
      <div className="col">
        <span>性别</span>
        <input type="text" className="sex" />
      </div>
      <div className="footer">
        <button className="cancel">取消</button>
        <button className="confirm">确定</button>
      </div>
    </div>
  </>
}