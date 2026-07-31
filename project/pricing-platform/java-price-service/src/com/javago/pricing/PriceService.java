package com.javago.pricing;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PriceService {
    private static final Map<String, Integer> BASE_PRICE_CENTS = new HashMap<>();

    static {
        BASE_PRICE_CENTS.put("SKU-1001", 129900);
        BASE_PRICE_CENTS.put("SKU-2002", 49900);
        BASE_PRICE_CENTS.put("SKU-3003", 8999);
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        server.createContext("/api/v1/price/calculate", PriceService::calculate);
        server.createContext("/health", PriceService::health);
        server.start();
        System.out.println("java-price-service started on http://localhost:8081");
    }

    private static void calculate(HttpExchange exchange) throws IOException {
        String traceId = exchange.getRequestHeaders().getFirst("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "trace-" + UUID.randomUUID();
        }

        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            respond(exchange, 405, response(40001, "Only POST is supported", "null", traceId));
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String sku = jsonString(body, "sku");
        String memberLevel = jsonString(body, "memberLevel");

        if (sku == null || memberLevel == null) {
            respond(exchange, 400, response(40001, "sku and memberLevel are required", "null", traceId));
            return;
        }

        int base = BASE_PRICE_CENTS.getOrDefault(sku, 99900);
        BigDecimal discount = switch (memberLevel) {
            case "GOLD" -> new BigDecimal("0.85");
            case "SILVER" -> new BigDecimal("0.92");
            default -> BigDecimal.ONE;
        };
        int finalCents = new BigDecimal(base).multiply(discount).setScale(0, RoundingMode.HALF_UP).intValue();
        String data = "{"
            + json("sku", sku) + ","
            + json("memberLevel", memberLevel) + ","
            + "\"basePriceCents\":" + base + ","
            + "\"finalPriceCents\":" + finalCents + ","
            + "\"discountRate\":" + json(discount.toPlainString()) + ","
            + json("calculatedAt", Instant.now().toString())
            + "}";
        respond(exchange, 200, response(0, "OK", data, traceId));
    }

    private static void health(HttpExchange exchange) throws IOException {
        respond(exchange, 200, response(0, "OK", "{\"status\":\"UP\"}", "health"));
    }

    private static String jsonString(String body, String field) {
        Matcher matcher = Pattern.compile("\\\"" + Pattern.quote(field) + "\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"").matcher(body);
        return matcher.find() ? matcher.group(1) : null;
    }

    private static String response(int code, String message, String dataJson, String traceId) {
        return "{\"code\":" + code
            + ",\"message\":" + json(message)
            + ",\"data\":" + dataJson
            + ",\"traceId\":" + json(traceId)
            + "}";
    }

    private static String json(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    private static String json(String key, String value) {
        return json(key) + ":" + json(value);
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }
}
