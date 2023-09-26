import "../style_iconfont.scss";
import icons from "../../../../iconfont/config.json";
import { Icon, Cell, CellGroup, Toast } from "@nutui/nutui-react";

const generateCopyText = (name: string) => {
  return `<Icon name="${name}"></Icon>`;
};
const generateAMCopyText = (icon: any) => {
  return `
  <Icon name="${icon.name}"
    className="${`nut-icon-${icon["animation-name"]}  nut-icon-${icon["animation-time"]}`}"/>`;
};
const copyTag = (text: string) => {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.setAttribute("value", text);
  input.select();
  if (document.execCommand("copy")) {
    document.execCommand("copy");
    Toast.text(`Copy: ${text}`);
  }
  document.body.removeChild(input);
};

const style = `
.nut-cell > .nutui-iconfont {
  margin-right: 10px;
}
ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  width: 100%;
}
ul li {
    flex: 0 0 25%;
    max-width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
ul li  span {
  height: 40px;
  font-size: 12px;
  text-align: center;
}
ul li span .nutui-iconfont {
  margin: 16px 0 16px;
}
`;

function App() {
  return (
    <div className="App">
      <style>{style}</style>
      <div className="demo">
        <h2>基础用法</h2>
        <Cell>
          <Icon name="dongdong" />
          <Icon name="jd" />
        </Cell>
        <h2>图片链接</h2>
        <Cell>
          <Icon
            size="40"
            name="https://img11.360buyimg.com/imagetools/jfs/t1/137646/13/7132/1648/5f4c748bE43da8ddd/a3f06d51dcae7b60.png"
          />
        </Cell>
        <h2>图标颜色</h2>
        <Cell>
          <Icon name="dongdong" color="#fa2c19" />
          <Icon name="dongdong" color="#64b578" />
          <Icon name="jd" color="#fa2c19" />
        </Cell>
        <h2>图标大小</h2>
        <Cell style={{ alignItems: "center" }}>
          <Icon name="dongdong" size="16" />
          <Icon name="dongdong" size="20" />
          <Icon name="dongdong" size="24" />
        </Cell>
        {icons.data.map((item, index) => {
          return (
            <CellGroup key={index} title={item.name}>
              <Cell>
                <ul>
                  {item.icons.map((icon) => {
                    return (
                      <li
                        key={icon}
                        onClick={() => copyTag(generateCopyText(icon))}
                      >
                        <Icon name={icon} />
                        <span>{icon}</span>
                      </li>
                    );
                  })}
                </ul>
              </Cell>
            </CellGroup>
          );
        })}
        {icons.style.map((item, index) => {
          return (
            <CellGroup key={index} title={item.name}>
              <Cell>
                <ul>
                  {item.icons.map((icon) => {
                    return (
                      <li
                        key={icon.name}
                        onClick={() => copyTag(generateAMCopyText(icon))}
                      >
                        <Icon
                          name={icon.name}
                          className={`nut-icon-${icon["animation-name"]}  nut-icon-${icon["animation-time"]}`}
                        />
                        <span>{icon["animation-name"]}</span>
                      </li>
                    );
                  })}
                </ul>
              </Cell>
            </CellGroup>
          );
        })}
      </div>
    </div>
  );
}

export default App;
