import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import HomepageArchitecture from "./components/HomepageArchitecture.vue";
import MermaidDiagram from "./components/MermaidDiagram.vue";
import "./styles.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("HomepageArchitecture", HomepageArchitecture);
    app.component("MermaidDiagram", MermaidDiagram);
  }
};
