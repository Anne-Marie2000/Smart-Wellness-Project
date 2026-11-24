
package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;

public class ContactServlet extends ApiServlet {

    @Override
    protected void doPost(HttpServletRequest req,
                          HttpServletResponse resp) throws IOException {

        try {
            JSONObject body = JsonUtil.readBody(req);

            int id = AppContext.contact().createMessage(
                JsonUtil.str(body, "name"),
                JsonUtil.str(body, "email"),
                JsonUtil.str(body, "subject"),
                JsonUtil.str(body, "message")
            );

            JsonUtil.send(resp, 201, new JSONObject()
                .put("id", id)
                .put("message", "Your message has been sent. Thank you!"));

        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
