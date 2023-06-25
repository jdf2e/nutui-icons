import { CSSProperties, computed, defineComponent } from 'vue'

export const defineSvgComponent = (name: string) => {
  return defineComponent({
    props: {
      class: { type: String, default: '' },
      name: { type: String, default: name },
      color: { type: String, default: '' },
      width: { type: [String, Number], default: '' },
      height: { type: [String, Number], default: '' },
    },
    setup(props) {
      const pxCheck = (value: string | number): string | undefined => {
        if (value) {
          return isNaN(Number(value)) ? String(value) : value + 'px'
        }
      }
      const classes = computed(() => {
        const prefixCls = 'nut-icon'
        return {
          [props.class]: props.class,
          [prefixCls]: true,
          [prefixCls + '-' + props.name]: props.name,
        }
      })
      const style = computed(() => {
        const style: CSSProperties = {}
        style.height = pxCheck(props.height)
        style.width = pxCheck(props.width)
        style.color = props.color
        return style
      })
      return { classes, style }
    }
  })
}