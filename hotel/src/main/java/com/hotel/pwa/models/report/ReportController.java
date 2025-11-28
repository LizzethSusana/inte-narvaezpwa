package com.hotel.pwa.models.report;

import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reports")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("")
    public ResponseEntity<APIResponse> findAll() {
        APIResponse response = reportService.findAll();
        return new ResponseEntity<>(response, response.getStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse> findById(@PathVariable("id") Long id) {
        APIResponse response = reportService.findById(id);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse> save(
            @RequestParam("title")  String title,
            @RequestParam("description") String description,
            @RequestParam("user_id") Long userId,
            @RequestParam("room_id") Long roomId,
            @RequestParam(value = "photo1", required = false) MultipartFile photo1,
            @RequestParam(value = "photo2", required = false) MultipartFile photo2,
            @RequestParam(value = "photo3", required = false) MultipartFile photo3) {

        try {
            if (title == null || title.trim().isEmpty()) {
                return new ResponseEntity<>(new APIResponse("El titulo es requerido", true, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
            }

            if (description == null || description.trim().isEmpty()) {
                return new ResponseEntity<>(new APIResponse("La descripción es requerida", true, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
            }
            if (userId == null) {
                return new ResponseEntity<>(new APIResponse("El usuario es requerido", true, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
            }
            if (roomId == null) {
                return new ResponseEntity<>(new APIResponse("La habitación es requerida", true, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
            }

            Report report = new Report();
            report.setTitle(title.trim());
            report.setDescription(description.trim());

            com.hotel.pwa.models.user.BeanUser user = new com.hotel.pwa.models.user.BeanUser();
            user.setId(userId);
            report.setUser(user);

            // Configurar habitación
            com.hotel.pwa.models.room.Room room = new com.hotel.pwa.models.room.Room();
            room.setId(roomId);
            report.setRoom(room);

            APIResponse response = reportService.save(report, photo1, photo2, photo3);
            return new ResponseEntity<>(response, response.getStatus());
        } catch (Exception e) {
            e.printStackTrace();
            APIResponse response = new APIResponse("Error en los datos proporcionados: " + e.getMessage(), true, HttpStatus.BAD_REQUEST);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse> update(
            @RequestParam("id") Long id,
            @RequestParam("title")  String title,
            @RequestParam("description") String description,
            @RequestParam("user_id") Long userId,
            @RequestParam("room_id") Long roomId,
            @RequestParam(value = "photo1", required = false) MultipartFile photo1,
            @RequestParam(value = "photo2", required = false) MultipartFile photo2,
            @RequestParam(value = "photo3", required = false) MultipartFile photo3) {

        try {
            Report report = new Report();
            report.setId(id);
            report.setTitle(title.trim());
            report.setDescription(description.trim());

            com.hotel.pwa.models.user.BeanUser user = new com.hotel.pwa.models.user.BeanUser();
            user.setId(userId);
            report.setUser(user);

            com.hotel.pwa.models.room.Room room = new com.hotel.pwa.models.room.Room();
            room.setId(roomId);
            report.setRoom(room);

            APIResponse response = reportService.update(report, photo1, photo2, photo3);
            return new ResponseEntity<>(response, response.getStatus());
        } catch (Exception e) {
            e.printStackTrace();
            APIResponse response = new APIResponse("Error en los datos proporcionados", true, HttpStatus.BAD_REQUEST);
            return new ResponseEntity<>(response, response.getStatus());
        }
    }

    @GetMapping("/image/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) {
        try {
            byte[] image = reportService.getImage(fileName);
            if (image == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(image.length);

            return new ResponseEntity<>(image, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("")
    public ResponseEntity<APIResponse> remove(@RequestBody Report payload) {
        APIResponse response = reportService.remove(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

}
