package com.hotel.pwa.models.report;

import com.hotel.pwa.utils.APIResponse;
import com.hotel.pwa.utils.FileService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.sql.SQLException;
import java.util.List;

@Service
@AllArgsConstructor
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private FileService fileService;


    @Transactional(readOnly = true)
    public APIResponse findAll(){
        List<Report> reports = reportRepository.findAll();
        // Generar URL completa para cada imagen
        reports.forEach(report -> {
            if (report.getPhoto1() != null && !report.getPhoto1().isEmpty()) {
                report.setPhoto1("/api/reports/image/" + report.getPhoto1());
            }
            if (report.getPhoto2() != null && !report.getPhoto2().isEmpty()) {
                report.setPhoto2("/api/reports/image/" + report.getPhoto2());
            }
            if (report.getPhoto3() != null && !report.getPhoto3().isEmpty()) {
                report.setPhoto3("/api/reports/image/" + report.getPhoto3());
            }
        });
        return new APIResponse("Operación exitosa", reports, false, HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public APIResponse findById(Long id){
        try{
            Report found = reportRepository.findById(id).orElse(null);
            if (found == null){
                return new APIResponse("Reporte no encontrado", true, HttpStatus.NOT_FOUND);
            }
            // Generar URL completa para las imágenes
            if (found.getPhoto1() != null && !found.getPhoto1().isEmpty()) {
                found.setPhoto1("/api/reports/image/" + found.getPhoto1());
            }
            if (found.getPhoto2() != null && !found.getPhoto2().isEmpty()) {
                found.setPhoto2("/api/reports/image/" + found.getPhoto2());
            }
            if (found.getPhoto3() != null && !found.getPhoto3().isEmpty()) {
                found.setPhoto3("/api/reports/image/" + found.getPhoto3());
            }
            return new APIResponse("Operación exitosa", found, false, HttpStatus.OK);
        }catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("No se pudo consultar el reporte", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse save(Report payload, MultipartFile photo1, MultipartFile photo2, MultipartFile photo3){
        try{
            // Validar que el usuario exista
            if (payload.getUser() == null || payload.getUser().getId() == null) {
                return new APIResponse("El usuario es requerido", true, HttpStatus.BAD_REQUEST);
            }

            // Validar que la habitación exista
            if (payload.getRoom() == null || payload.getRoom().getId() == null) {
                return new APIResponse("La habitación es requerida", true, HttpStatus.BAD_REQUEST);
            }

            // Guardar foto 1 si se proporciona
            if (photo1 != null && !photo1.isEmpty()) {
                String fileName1 = fileService.saveFile(photo1);
                payload.setPhoto1(fileName1);
            }

            // Guardar foto 2 si se proporciona
            if (photo2 != null && !photo2.isEmpty()) {
                String fileName2 = fileService.saveFile(photo2);
                payload.setPhoto2(fileName2);
            }

            // Guardar foto 3 si se proporciona
            if (photo3 != null && !photo3.isEmpty()) {
                String fileName3 = fileService.saveFile(photo3);
                payload.setPhoto3(fileName3);
            }

            reportRepository.save(payload);
            return new APIResponse("Reporte registrado correctamente", false, HttpStatus.CREATED);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo registrar el reporte", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse update(Report payload, MultipartFile photo1, MultipartFile photo2, MultipartFile photo3){
        try{
            Report existingReport = reportRepository.findById(payload.getId()).orElse(null);
            if (existingReport == null){
                return new APIResponse("Reporte no encontrado", true, HttpStatus.NOT_FOUND);
            }

            // Validar que el usuario exista
            if (payload.getUser() == null || payload.getUser().getId() == null) {
                return new APIResponse("El usuario es requerido", true, HttpStatus.BAD_REQUEST);
            }

            // Validar que la habitación exista
            if (payload.getRoom() == null || payload.getRoom().getId() == null) {
                return new APIResponse("La habitación es requerida", true, HttpStatus.BAD_REQUEST);
            }

            // Manejar foto 1
            if (photo1 != null && !photo1.isEmpty()) {
                // Eliminar foto anterior si existe
                if (existingReport.getPhoto1() != null && !existingReport.getPhoto1().isEmpty()) {
                    fileService.deleteFile(existingReport.getPhoto1());
                }
                // Guardar nueva foto
                String fileName1 = fileService.saveFile(photo1);
                payload.setPhoto1(fileName1);
            } else {
                // Mantener foto existente
                payload.setPhoto1(existingReport.getPhoto1());
            }

            // Manejar foto 2
            if (photo2 != null && !photo2.isEmpty()) {
                if (existingReport.getPhoto2() != null && !existingReport.getPhoto2().isEmpty()) {
                    fileService.deleteFile(existingReport.getPhoto2());
                }
                String fileName2 = fileService.saveFile(photo2);
                payload.setPhoto2(fileName2);
            } else {
                payload.setPhoto2(existingReport.getPhoto2());
            }

            // Manejar foto 3
            if (photo3 != null && !photo3.isEmpty()) {
                if (existingReport.getPhoto3() != null && !existingReport.getPhoto3().isEmpty()) {
                    fileService.deleteFile(existingReport.getPhoto3());
                }
                String fileName3 = fileService.saveFile(photo3);
                payload.setPhoto3(fileName3);
            } else {
                payload.setPhoto3(existingReport.getPhoto3());
            }

            reportRepository.save(payload);
            return new APIResponse("Reporte actualizado correctamente", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo actualizar el reporte", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse remove(Report payload){
        try{
            Report existingReport = reportRepository.findById(payload.getId()).orElse(null);
            if (existingReport == null){
                return new APIResponse("Reporte no encontrado", true, HttpStatus.NOT_FOUND);
            }

            // Eliminar imágenes asociadas
            if (existingReport.getPhoto1() != null && !existingReport.getPhoto1().isEmpty()) {
                fileService.deleteFile(existingReport.getPhoto1());
            }
            if (existingReport.getPhoto2() != null && !existingReport.getPhoto2().isEmpty()) {
                fileService.deleteFile(existingReport.getPhoto2());
            }
            if (existingReport.getPhoto3() != null && !existingReport.getPhoto3().isEmpty()) {
                fileService.deleteFile(existingReport.getPhoto3());
            }

            reportRepository.deleteById(payload.getId());
            return new APIResponse("Reporte eliminado correctamente", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo eliminar el reporte", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public byte[] getImage(String fileName) {
        try {
            return fileService.getFile(fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
