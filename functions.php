/**
 * Optimize Vagaro Widget Loading
 */
function vagaro_widget_scripts() {
    // Enqueue the Vagaro script with defer attribute
    wp_enqueue_script(
        'vagaro-widget', 
        'https://www.vagaro.com//resources/WidgetEmbeddedLoader/OZqpCpCrC3ScT3qmV35y6puSdBuOc1WJD1wOc1WO61CxdfkJE1wZCBOvifCs7fYJEPwMc8?v=70Tt0KhMybt9mJGfQbwystC0YloPv6NbghzYqcZdRYnW#',
        array(),
        null,
        true
    );
    
    // Add defer attribute to script
    add_filter('script_loader_tag', 'add_defer_to_vagaro_script', 10, 2);
    
    // Add inline CSS
    wp_add_inline_style('theme-style', '
        .embedded-widget-title {
            font-size: 23px;
            color: #333;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 24px;
            padding: 18px 10px 8px;
            text-align: center;
            box-sizing: border-box;
        }
        
        .vagaro {
            width: 250px;
            padding: 0;
            border: 0;
            margin: 0 auto;
            text-align: center;
        }
        
        .vagaro a {
            font-size: 14px;
            color: #aaa;
            text-decoration: none;
        }
    ');
}
add_action('wp_enqueue_scripts', 'vagaro_widget_scripts');

/**
 * Add defer attribute to Vagaro script
 */
function add_defer_to_vagaro_script($tag, $handle) {
    if ('vagaro-widget' === $handle) {
        return str_replace(' src', ' defer src', $tag);
    }
    return $tag;
}

/**
 * Shortcode for Vagaro Widget
 */
function vagaro_widget_shortcode() {
    ob_start();
    ?>
    <div id="frameTitle" class="embedded-widget-title"></div>
    <div class="vagaro">
        <a href="https://www.vagaro.com/pro/">Powered by Vagaro</a>&nbsp;
        <a href="https://www.vagaro.com/pro/salon-software">Salon Software</a>,&nbsp;
        <a href="https://www.vagaro.com/pro/spa-software">Spa Software</a>&nbsp;&&nbsp;
        <a href="https://www.vagaro.com/pro/fitness-software">Fitness Software</a>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('vagaro_widget', 'vagaro_widget_shortcode'); 