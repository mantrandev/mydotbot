---
name: liquid-glass-ios
description: "Implements Liquid Glass design effects in SwiftUI and UIKit. Use when adding glass effects, glass buttons, glass containers, morphing transitions, or adopting Apple Liquid Glass design system."
---

# Liquid Glass iOS Implementation

Implements Apple's Liquid Glass design system in SwiftUI and UIKit. Liquid Glass is a dynamic material that blurs content behind it, reflects color and light, and reacts to touch/pointer interactions.

## When to Use

- Adding glass effects to views or buttons
- Creating glass containers with merging/morphing effects
- Adopting new Apple design language (iOS 26+)
- Building interactive glass elements
- Implementing glass toolbar items

## Quick Reference

### SwiftUI

#### Basic Glass Effect

```swift
Text("Hello")
    .padding()
    .glassEffect()  // Default: regular variant, capsule shape
```

#### Custom Shape

```swift
Text("Hello")
    .padding()
    .glassEffect(in: .rect(cornerRadius: 16.0))
```

Shapes: `.capsule` (default), `.rect(cornerRadius:)`, `.circle`

#### Glass Variants

```swift
.glassEffect(.regular.tint(.orange).interactive())
```

- `.regular` — Standard glass
- `.tint(Color)` — Color tint for prominence
- `.interactive()` — Reacts to touch/pointer

#### Glass Buttons

```swift
Button("Action") { }
    .buttonStyle(.glass)

Button("Important") { }
    .buttonStyle(.glassProminent)
```

#### Multiple Glass Elements — Container

Always wrap multiple glass views in `GlassEffectContainer`:

```swift
GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "pencil")
            .frame(width: 80, height: 80)
            .glassEffect()

        Image(systemName: "eraser.fill")
            .frame(width: 80, height: 80)
            .glassEffect()
    }
}
```

`spacing` controls merge distance between glass elements.

#### Uniting Glass Effects

Combine views into a single glass effect:

```swift
@Namespace private var namespace

GlassEffectContainer(spacing: 20.0) {
    HStack(spacing: 20.0) {
        ForEach(items.indices, id: \.self) { item in
            Image(systemName: items[item])
                .frame(width: 80, height: 80)
                .glassEffect()
                .glassEffectUnion(id: item < 2 ? "1" : "2", namespace: namespace)
        }
    }
}
```

#### Morphing Transitions

```swift
@State private var isExpanded = false
@Namespace private var namespace

GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "pencil")
            .frame(width: 80, height: 80)
            .glassEffect()
            .glassEffectID("pencil", in: namespace)

        if isExpanded {
            Image(systemName: "eraser.fill")
                .frame(width: 80, height: 80)
                .glassEffect()
                .glassEffectID("eraser", in: namespace)
        }
    }
}

Button("Toggle") {
    withAnimation { isExpanded.toggle() }
}
.buttonStyle(.glass)
```

#### Toolbar Glass Background

```swift
.toolbar(id: "main") {
    ToolbarItem(id: "status", placement: .principal) {
        StatusView()
    }
    .sharedBackgroundVisibility(.hidden)  // Opt out of shared glass
}
```

#### Scroll Extension Under Sidebar

```swift
ScrollView(.horizontal) {
    // content
}
.scrollExtensionMode(.underSidebar)
```

### UIKit

#### Basic Glass Effect

```swift
let glassEffect = UIGlassEffect()
let effectView = UIVisualEffectView(effect: glassEffect)
effectView.layer.cornerRadius = 20
effectView.clipsToBounds = true
view.addSubview(effectView)
```

#### Customization

```swift
glassEffect.tintColor = UIColor.systemBlue.withAlphaComponent(0.3)
glassEffect.isInteractive = true
```

#### Glass Container (Multiple Elements)

```swift
let containerEffect = UIGlassContainerEffect()
containerEffect.spacing = 40.0

let containerView = UIVisualEffectView(effect: containerEffect)

let glass1 = UIVisualEffectView(effect: UIGlassEffect())
let glass2 = UIVisualEffectView(effect: UIGlassEffect())

containerView.contentView.addSubview(glass1)
containerView.contentView.addSubview(glass2)
```

#### Scroll Edge Effects

```swift
scrollView.topEdgeEffect.style = .automatic
scrollView.bottomEdgeEffect.style = .hard
scrollView.leftEdgeEffect.isHidden = true
```

Styles: `.automatic`, `.hard`

#### Scroll Edge Element Container Interaction

```swift
let interaction = UIScrollEdgeElementContainerInteraction()
interaction.scrollView = scrollView
interaction.edge = .bottom
overlayContainer.addInteraction(interaction)
```

#### Toolbar Item Glass

```swift
let button = UIBarButtonItem(...)
button.hidesSharedBackground = true  // Opt out of shared glass
```

### WidgetKit

#### Rendering Modes

```swift
@Environment(\.widgetRenderingMode) var renderingMode

var body: some View {
    if renderingMode == .accented {
        // Accented mode layout
    } else {
        // Full color layout
    }
}
```

#### Accent Groups

```swift
Text("Title")
    .widgetAccentable()

Image("photo")
    .widgetAccentedRenderingMode(.monochrome)
```

#### Container Background

```swift
.containerBackground(for: .widget) {
    Color.blue.opacity(0.2)
}
```

## Best Practices

1. **Always use `GlassEffectContainer`** for multiple glass views (performance + morphing)
2. **Apply `.glassEffect()` last** — after other appearance modifiers
3. **Use `.interactive()`** only on elements that respond to user interaction
4. **Subtle tint colors** — avoid opaque tints, use low alpha
5. **Test on older devices** — glass effects are GPU-intensive
6. **Ensure contrast** — text on glass must meet accessibility requirements
7. **Animate view hierarchy changes** — enables smooth morphing transitions
8. **Consistent shapes** — maintain uniform corner radii across the app

## Detailed Reference

Read `reference/swiftui-liquid-glass.md` for full SwiftUI guide with advanced examples.
Read `reference/uikit-liquid-glass.md` for full UIKit guide with reusable components.
Read `reference/widgetkit-liquid-glass.md` for widget-specific implementation.

## Apple Documentation Links

- [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/SwiftUI/Applying-Liquid-Glass-to-custom-views)
- [Landmarks: Building an app with Liquid Glass](https://developer.apple.com/documentation/SwiftUI/Landmarks-Building-an-app-with-Liquid-Glass)
- [SwiftUI GlassEffectContainer](https://developer.apple.com/documentation/SwiftUI/GlassEffectContainer)
- [UIGlassEffect](https://developer.apple.com/documentation/UIKit/UIGlassEffect)
- [UIGlassContainerEffect](https://developer.apple.com/documentation/UIKit/UIGlassContainerEffect)
- [Optimizing widgets for Liquid Glass](https://developer.apple.com/documentation/WidgetKit/optimizing-your-widget-for-accented-rendering-mode-and-liquid-glass)
