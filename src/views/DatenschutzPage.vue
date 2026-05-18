<template lang="pug">

div(class="datenschutz-container")

  Button(variant="brand-outline" class="bg-primary text-primary w-50" @click="navToIndex()") Zurück
  h3 Datenschutzerklärung
  //- Kapitel 1
  h4 Informationen über die Verarbeitung Ihrer Daten gemäß Art. 13 der Datenschutz-Grundverordnung (DS-GVO)
  ol
    li 
      //- Kapitel 1.1
      h5 Verantwortlicher und Datenschutzbeauftragter
      p Verantwortlich für diese Website ist
      p Andreas Ivanov,40699 Erkrath Stahlenhauser Straße 39,andreasivanov80@gmail.com.

      //- p Den Datenschutzbeauftragten erreichen Sie per E-Mail unter
      //-   | [E-Mail-Adresse des Datenschutzbeauftragten]
      //-   | oder über die Adresse
      //-   | [ggf. auch die Postadresse des Datenschutzbeauftragten].

    q-separator
    li
      //- Kapitel 1.2
      h5 Daten, die für die Bereitstellung der Website und die Erstellung der Protokolldateien verarbeitet werden
      ol(style="list-style-type: lower-alpha")
        li
          //- Kapitel 1.2.1
          h6 Welche Daten werden für welchen Zweck verarbeitet?
          p Bei jedem Zugriff auf Inhalte der Website werden vorübergehend Daten gespeichert, die möglicherweise eine Identifizierung zulassen. Die folgenden Daten werden hierbei erhoben:
        
        ul
          li Datum und Uhrzeit des Zugriffs
          li IP-Adresse
          li Hostname des zugreifenden Rechners
          li Website, von der aus die Website aufgerufen wurde
          li Websites, die über die Website aufgerufen werden
          li Besuchte Seite auf unserer Website
          li Meldung, ob der Abruf erfolgreich war
          li Übertragene Datenmenge
          li Informationen über den Browsertyp und die verwendete Version
          li Betriebssystem
        
        p Die vorübergehende Speicherung der Daten ist für den Ablauf eines Websitebesuchs erforderlich, um eine Auslieferung der Website zu ermöglichen. Eine weitere Speicherung in Protokolldateien erfolgt, um die Funktionsfähigkeit der Website und die Sicherheit der informationstechnischen Systeme sicherzustellen. In diesen Zwecken liegt auch unser berechtigtes Interesse an der Datenverarbeitung.

        li
          //- Kapitel 1.2.2
          h6 Auf welcher Rechtsgrundlage werden diese Daten verarbeitet?
          p Die Daten werden auf der Grundlage des Art. 6 Abs. 1 Buchstabe f DS-GVO verarbeitet.

        li
          //- Kapitel 1.2.3
          h6 Gibt es neben dem Verantwortlichen weitere Empfänger der personenbezogenen Daten?
          p Die Website wird bei der netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, gehostet.
            |  Mit dem Hostinganbieter wurde ein Auftragsverarbeitungsvertrag (AV-Vertrag) gemäß Art. 28 DSGVO abgeschlossen.

        li
          //- Kapitel 1.2.4
          h6 Wie lange werden die Daten gespeichert?
          p Die Daten werden gelöscht, sobald sie für die Erreichung des Zwecks ihrer Erhebung nicht mehr erforderlich sind. 
            | Bei der Bereitstellung der Website ist dies der Fall, wenn die jeweilige Sitzung beendet ist. 
            | Die Protokolldateien werden nach maximal 14 Tagen direkt und ausschließlich für Administratoren zugänglich aufbewahrt. 
            | Danach sind sie nur noch indirekt über die Rekonstruktion von Sicherungsbändern verfügbar und werden nach nach maximal 14 Tagen endgültig gelöscht.

    q-separator
    li
      //- Kapitel 1.3
      h5 Betroffenenrechte
      ol(style="list-style-type: lower-alpha")
        li
          h6 Recht auf Auskunft
          p Sie können Auskunft nach Art. 15 DS-GVO über Ihre personenbezogenen Daten verlangen, die wir verarbeiten.

        li
          h6 Recht auf Widerspruch:
          p Sie haben ein Recht auf Widerspruch aus besonderen Gründen (siehe unter Punkt II).

        li
          h6 Recht auf Berichtigung
          p Sollten die Sie betreffenden Angaben nicht (mehr) zutreffend sein, können Sie nach Art. 16 DS-GVO eine Berichtigung verlangen. Sollten Ihre Daten unvollständig sein, können Sie eine Vervollständigung verlangen.

        li
          h6 Recht auf Löschung
          p Sie können nach Art. 17 DS-GVO die Löschung Ihrer personenbezogenen Daten verlangen.

        li
          h6 Recht auf Einschränkung der Verarbeitung
          p Sie haben nach Art. 18 DS-GVO das Recht, eine Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.

        li 
          h6 Recht auf Beschwerde
          p Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen Datenschutzrecht verstößt, haben Sie nach Ar. 77 Abs. 1 DS-GVO das Recht, sich bei einer Datenschutzaufsichtsbehörde eigener Wahl zu beschweren. Hierzu gehört auch die für den Verantwortlichen zuständige Datenschutzaufsichtsbehörde: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, https://www.ldi.nrw.de/kontakt/ihre-beschwerde.

        li
          h6 Recht auf Datenübertragbarkeit
          p Für den Fall, dass die Voraussetzungen des Art. 20 Abs. 1 DS-GVO vorliegen, steht Ihnen das Recht zu, sich Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an Dritte aushändigen zu lassen. Die Erfassung der Daten zur Bereitstellung der Website und die Speicherung der Protokolldateien sind für den Betrieb der Internetseite zwingend erforderlich. Sie beruhen daher nicht auf einer Einwilligung nach Art. 6 Abs. 1 Buchstabe a DS-GVO oder auf einem Vertrag nach Art. 6 Abs. 1 Buchstabe b DS-GVO, sondern sind nach Art. 6 Abs. 1 Buchstabe f DS-GVO gerechtfertigt. Die Voraussetzungen des Art. 20 Abs. 1 DS-GVO sind demnach insoweit nicht erfüllt.

  //- Kapitel 2
  h4 Recht auf Widerspruch gemäß Art. 21 Abs. 1 DS-GVO
  p Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten, die aufgrund von Artikel 6 Abs. 1 Buchstabe f DS-GVO erfolgt, Widerspruch einzulegen. Der Verantwortliche verarbeitet die personenbezogenen Daten dann nicht mehr, es sei denn, er kann zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die die Interessen, Rechte und Freiheiten der betroffenen Person überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen. Die Erfassung der Daten zur Bereitstellung der Website und die Speicherung der Protokolldateien sind für den Betrieb der Internetseite zwingend erforderlich.
    
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter()

function navToIndex() {
  return router.push("/")
}

onMounted(() => {
 
})
</script>

<style scoped>
h3 {
  font-weight: 700;
  font-size: 2rem;
  line-height: 2rem;
  letter-spacing: normal;
}
h4 {
  font-weight: 700;
  font-size: 1.55rem;
  line-height: 1.5rem;
  letter-spacing: normal;
}
h5 {
  margin: 1.5rem;
}
h6 {
  margin: 0.75rem;
}
p {
  font-size: 16px;
}
.datenschutz-container{
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  gap: 1em;
  padding: 4rem;
}
.a11y:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 0.5rem;
  border-radius: 0.5rem;
}
</style>
