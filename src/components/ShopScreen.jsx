export default function ShopScreen({ encounter, money, onResolve }) {
  const items = [['Potion', 40], ['Super Potion', 80], ['Revive', 120], ['Poké Ball', 30]];
  return <section className="retro-panel shop-screen"><div className="shop-screen__header"><b>POKé MART</b><b>¥ {money}</b></div><div className="retro-menu">{items.map(([item, price], index) => <button type="button" key={item} onClick={() => onResolve(item)}>{index === 0 ? '▶ ' : '　'}{item}<span>¥ {price}</span></button>)}</div><p>“What would you like?”</p><button type="button" className="text-button" onClick={() => onResolve('Leave')}>LEAVE SHOP</button></section>;
}
